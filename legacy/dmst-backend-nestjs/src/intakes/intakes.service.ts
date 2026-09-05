import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { In, Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import {
  buildB2bChallengePrompt,
  buildB2bMarketingPrompt,
} from '../ai/prompts/b2b-marketing.prompt';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { SearchService } from '../search/search.service';
import { UserSettingsService } from '../users/services/user-settings.service';
import { User } from '../users/user.entity';
import {
  INTAKES_QUEUE_NAME,
  IntakesJobName,
} from './constants/intakes.constants';
import {
  CreateIntakeDto,
  QueryIntakeDto,
  UpdateIntakeDto,
} from './dto/intake.dto';
import {
  IntakeAttachment,
  IntakeAttachmentType,
  ConfidentialLevel,
} from './intake-attachment.entity';
import { IntakeChunk } from './intake-chunk.entity';
import { IntakeMatch } from './intake-match.entity';
import { IntakeSector } from './intake-sector.entity';
import {
  AiChunkingStatus,
  AiProcessingStatus,
  Intake,
  IntakeStatus,
  IntakeType,
} from './intake.entity';
import { Sector } from './sector.entity';
import { Category } from './category.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedIntakeResult extends PaginatedResult<Intake> {
  totalByStatus: { draft: number; published: number };
}

@Injectable()
export class IntakesService {
  private readonly logger = new Logger(IntakesService.name);

  constructor(
    @InjectRepository(Intake)
    private readonly intakeRepository: Repository<Intake>,
    @InjectRepository(IntakeAttachment)
    private readonly attachmentRepository: Repository<IntakeAttachment>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(IntakeChunk)
    private readonly intakeChunkRepository: Repository<IntakeChunk>,
    @InjectRepository(IntakeSector)
    private readonly intakeSectorRepository: Repository<IntakeSector>,
    @InjectRepository(IntakeMatch)
    private readonly intakeMatchRepository: Repository<IntakeMatch>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly fileUploadService: FileUploadService,
    private readonly aiService: AiService,
    private readonly searchService: SearchService,
    private readonly userSettingsService: UserSettingsService,
    @InjectQueue(INTAKES_QUEUE_NAME) private readonly intakesQueue: Queue,
  ) {}

  private async startAiProcessing(
    intake: Pick<Intake, 'id' | 'title' | 'content'>,
  ): Promise<void> {
    if (!intake.content) return;

    await this.intakeRepository.update(intake.id, {
      aiProcessTitle: null,
      aiProcessedContent: null,
      aiProcessingStatus: AiProcessingStatus.PROCESSING,
      aiChunkingStatus: null,
    });

    void this.applyAiProcessing({
      id: intake.id,
      title: intake.title,
      content: intake.content,
    } as Intake);
  }

  private async applyAiProcessing(intake: Intake): Promise<void> {
    if (!intake.content) return;

    // LLM beautification (B2B marketing rewrite) is disabled.
    // Skip the ai.completion job and proceed directly to chunk-embed
    // using the original content.
    await this.intakeRepository.update(intake.id, {
      aiProcessingStatus: AiProcessingStatus.COMPLETED,
      aiChunkingStatus: AiChunkingStatus.PROCESSING,
    });
    void this.applyChunkEmbedding(intake.id, intake.content);
  }

  private async applyChunkEmbedding(
    intakeId: string,
    text: string,
  ): Promise<void> {
    try {
      const result = await this.aiService.chunkEmbed({
        text,
        referenceId: intakeId,
        referenceType: 'intake',
      });

      // Delete old chunks then insert new ones
      await this.intakeChunkRepository.delete({ intakeId });
      const chunks = result.chunks.map((chunk) =>
        this.intakeChunkRepository.create({
          intakeId,
          index: chunk.index,
          text: chunk.text,
          embedding: chunk.embedding,
        }),
      );
      await this.intakeChunkRepository.save(chunks);

      // Hand the embeddings straight through — chunk-embed already produced
      // dense and sparse in one BGE-M3 pass, so indexIntake must not re-run it.
      void this.searchService
        .indexIntake(
          intakeId,
          result.chunks.map((c) => ({
            index: c.index,
            embedding: c.embedding,
            sparse: c.sparse,
          })),
        )
        .then(async () => {
          const intake = await this.intakeRepository.findOne({
            where: { id: intakeId },
            select: ['userId'],
          });
          if (intake?.userId) {
            const settings = await this.userSettingsService.getSettings(
              intake.userId,
            );
            if (settings.matchingAuto) {
              void this.intakesQueue.add(IntakesJobName.COMPUTE_MATCHES, {
                intakeId,
              });
            }
          } else {
            // No owner (seed/admin intake) — always enqueue compute matches
            void this.intakesQueue.add(IntakesJobName.COMPUTE_MATCHES, {
              intakeId,
            });
          }
        });

      await this.intakeRepository.update(intakeId, {
        aiChunkingStatus: AiChunkingStatus.COMPLETED,
      });
    } catch (error) {
      this.logger.error(
        `Chunk embedding failed for intake ${intakeId}: ${String(error)}`,
      );
      await this.intakeRepository.update(intakeId, {
        aiChunkingStatus: AiChunkingStatus.FAILED,
      });
    }
  }

  async create(
    createIntakeDto: CreateIntakeDto,
    files: Express.Multer.File[],
    userId: string,
    filesL2?: Express.Multer.File[],
    filesL3?: Express.Multer.File[],
    profilePicture?: Express.Multer.File,
  ): Promise<Intake> {
    const { sectorIds, categoryId, ...restDto } = createIntakeDto;

    const intake = this.intakeRepository.create({
      ...restDto,
      userId,
      category: categoryId ? ({ id: categoryId } as Category) : null,
    });

    const savedIntake = await this.intakeRepository.save(intake);

    // Handle sector associations
    if (sectorIds && sectorIds.length > 0) {
      await this.updateSectorAssociations(savedIntake.id, sectorIds);
    }

    // Handle profile picture
    if (profilePicture) {
      await this.saveProfilePicture(savedIntake.id, profilePicture);
    }

    // Handle public file attachments (confidentialLevel = null)
    if (files && files.length > 0) {
      await this.saveAttachments(savedIntake.id, files, null);
    }

    // Handle level 2 file attachments
    if (filesL2 && filesL2.length > 0) {
      await this.saveAttachments(
        savedIntake.id,
        filesL2,
        ConfidentialLevel.LEVEL_2,
      );
    }

    // Handle level 3 file attachments
    if (filesL3 && filesL3.length > 0) {
      await this.saveAttachments(
        savedIntake.id,
        filesL3,
        ConfidentialLevel.LEVEL_3,
      );
    }

    await this.startAiProcessing(savedIntake);

    // Reload to get attachments
    return await this.findOne(savedIntake.id);
  }

  async findAll(query: QueryIntakeDto): Promise<PaginatedIntakeResult> {
    const { type, status, sectorId, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.intakeRepository
      .createQueryBuilder('intake')
      .leftJoinAndSelect('intake.attachments', 'attachments')
      .leftJoinAndSelect('intake.intakeSectors', 'intakeSectors')
      .leftJoinAndSelect('intakeSectors.sector', 'sector')
      .leftJoinAndSelect('intake.category', 'category')
      .leftJoinAndSelect('intake.user', 'user')
      .withDeleted();

    if (type) {
      queryBuilder.andWhere('intake.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('intake.status = :status', { status });
    }

    if (sectorId) {
      queryBuilder.andWhere('sector.id = :sectorId', { sectorId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(intake.title ILIKE :search OR intake.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('intake.createdAt', 'DESC').skip(skip).take(limit);

    const [intakes, total] = await queryBuilder.getManyAndCount();

    // Always compute totalByStatus from the full (unfiltered) dataset, applying type/sector/search
    const countBuilder = this.intakeRepository
      .createQueryBuilder('intake')
      .leftJoin('intake.intakeSectors', 'intakeSectors')
      .withDeleted();

    if (type) {
      countBuilder.andWhere('intake.type = :type', { type });
    }
    if (sectorId) {
      countBuilder.andWhere('intakeSectors.sectorId = :sectorId', {
        sectorId,
      });
    }
    if (search) {
      countBuilder.andWhere(
        '(intake.title ILIKE :search OR intake.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [draftCount, publishedCount] = await Promise.all([
      countBuilder
        .clone()
        .andWhere('intake.status = :draftStatus', {
          draftStatus: IntakeStatus.DRAFT,
        })
        .getCount(),
      countBuilder
        .clone()
        .andWhere('intake.status = :publishedStatus', {
          publishedStatus: IntakeStatus.PUBLISHED,
        })
        .getCount(),
    ]);

    return {
      data: intakes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalByStatus: { draft: draftCount, published: publishedCount },
    };
  }

  async findOne(id: string): Promise<Intake & { matches: IntakeMatch[] }> {
    const intake = await this.intakeRepository.findOne({
      where: { id },
      relations: [
        'attachments',
        'intakeSectors',
        'intakeSectors.sector',
        'category',
        'user',
      ],
      withDeleted: true,
    });

    if (!intake) {
      throw new NotFoundException(`Intake with ID ${id} not found`);
    }

    const matches = await this.loadMatches(intake);
    return Object.assign(intake, { matches });
  }

  private async loadMatches(intake: Intake): Promise<IntakeMatch[]> {
    const isIp = intake.type === IntakeType.IP;
    const where = isIp
      ? { ipIntakeId: intake.id }
      : { challengeIntakeId: intake.id };

    return this.intakeMatchRepository.find({
      where,
      relations: isIp
        ? [
            'challengeIntake',
            'challengeIntake.intakeSectors',
            'challengeIntake.intakeSectors.sector',
          ]
        : [
            'ipIntake',
            'ipIntake.intakeSectors',
            'ipIntake.intakeSectors.sector',
          ],
      order: { score: 'DESC' },
      take: 5,
    });
  }

  async findMatches(
    id: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<IntakeMatch>> {
    const intake = await this.intakeRepository.findOne({ where: { id } });
    if (!intake) {
      throw new NotFoundException(`Intake with ID ${id} not found`);
    }

    const isIp = intake.type === IntakeType.IP;
    const where = isIp ? { ipIntakeId: id } : { challengeIntakeId: id };

    const relations = isIp
      ? [
          'challengeIntake',
          'challengeIntake.intakeSectors',
          'challengeIntake.intakeSectors.sector',
        ]
      : ['ipIntake', 'ipIntake.intakeSectors', 'ipIntake.intakeSectors.sector'];

    const [data, total] = await this.intakeMatchRepository.findAndCount({
      where,
      relations,
      order: { score: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllForUser(
    query: QueryIntakeDto,
  ): Promise<PaginatedResult<Intake>> {
    const { type, sectorId, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.intakeRepository
      .createQueryBuilder('intake')
      .leftJoinAndSelect('intake.attachments', 'attachments')
      .leftJoinAndSelect('intake.intakeSectors', 'intakeSectors')
      .leftJoinAndSelect('intakeSectors.sector', 'sector');

    if (type) {
      queryBuilder.andWhere('intake.type = :type', { type });
    }

    if (sectorId) {
      queryBuilder.andWhere('sector.id = :sectorId', { sectorId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(intake.title ILIKE :search OR intake.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const countQueryBuilder = queryBuilder.clone();

    const total = await countQueryBuilder.getCount();

    queryBuilder.orderBy('intake.createdAt', 'DESC').skip(skip).take(limit);

    const intakes = await queryBuilder.getMany();

    return {
      data: await this.attachUserIds(intakes),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDiscoverableIntakes(
    userId: string,
    query: QueryIntakeDto,
  ): Promise<PaginatedResult<Intake>> {
    const { type, sectorId, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.intakeRepository
      .createQueryBuilder('intake')
      .leftJoinAndSelect('intake.attachments', 'attachments')
      .leftJoinAndSelect('intake.intakeSectors', 'intakeSectors')
      .leftJoinAndSelect('intakeSectors.sector', 'sector')
      .where('intake.status = :status', { status: IntakeStatus.PUBLISHED });

    if (type) {
      queryBuilder.andWhere('intake.type = :type', { type });
    }

    if (sectorId) {
      queryBuilder.andWhere('sector.id = :sectorId', { sectorId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(intake.title ILIKE :search OR intake.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.clone().getCount();

    queryBuilder.orderBy('intake.createdAt', 'DESC').skip(skip).take(limit);

    const intakes = await queryBuilder.getMany();

    return {
      data: await this.attachUserIds(intakes),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneForUser(id: string, currentUserId?: string): Promise<Intake> {
    const intake = await this.findOne(id);
    const isOwner = !!currentUserId && intake.userId === currentUserId;
    if (isOwner) {
      return intake;
    }

    return this.redactIntakeForNonOwner(intake);
  }

  private redactIntakeForNonOwner(
    intake: Intake & { matches?: IntakeMatch[] },
  ): Intake {
    const publicAttachments = (intake.attachments ?? []).filter(
      (a) => !a.confidentialLevel,
    );

    const redacted = new Intake();
    Object.assign(redacted, intake, {
      confidentialLevel2Content: null,
      confidentialLevel2AiProcessedContent: null,
      confidentialLevel3Content: null,
      confidentialLevel3AiProcessedContent: null,
      attachments: publicAttachments,
    });
    delete (redacted as { user?: User }).user;
    delete (redacted as { matches?: IntakeMatch[] }).matches;

    return redacted;
  }

  private toMarketplaceItem(intake: Intake) {
    const publicAttachments = (intake.attachments ?? [])
      .filter(
        (a) =>
          !a.confidentialLevel &&
          a.fileType !== IntakeAttachmentType.PROFILE_PICTURE,
      )
      .map(({ id, fileName, filePath, fileType, mimeType, fileSize }) => ({
        id,
        fileName,
        filePath,
        fileType,
        mimeType,
        fileSize,
      }));

    return {
      id: intake.id,
      title: intake.title,
      aiProcessTitle: intake.aiProcessTitle,
      content: intake.content,
      aiProcessedContent: intake.aiProcessedContent,
      aiProcessingStatus: intake.aiProcessingStatus,
      type: intake.type,
      status: intake.status,
      profilePicUrl: intake.profilePicUrl,
      createdAt: intake.createdAt,
      updatedAt: intake.updatedAt,
      userId: intake.userId,
      intakeSectors: intake.intakeSectors,
      attachments: publicAttachments,
    };
  }

  async findMarketplaceIntakes(
    userId: string,
    query: QueryIntakeDto,
  ): Promise<PaginatedResult<ReturnType<IntakesService['toMarketplaceItem']>>> {
    const { type, sectorId, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.intakeRepository
      .createQueryBuilder('intake')
      .leftJoinAndSelect('intake.attachments', 'attachments')
      .leftJoinAndSelect('intake.intakeSectors', 'intakeSectors')
      .leftJoinAndSelect('intakeSectors.sector', 'sector')
      .where('intake.status = :status', { status: IntakeStatus.PUBLISHED });

    if (type) {
      queryBuilder.andWhere('intake.type = :type', { type });
    }
    if (sectorId) {
      queryBuilder.andWhere('sector.id = :sectorId', { sectorId });
    }
    if (search) {
      queryBuilder.andWhere(
        '(intake.title ILIKE :search OR intake.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.clone().getCount();
    queryBuilder.orderBy('intake.createdAt', 'DESC').skip(skip).take(limit);
    const intakes = await queryBuilder.getMany();

    return {
      data: intakes.map((i) => this.toMarketplaceItem(i)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMarketplaceIntakeById(id: string) {
    const intake = await this.intakeRepository.findOne({
      where: { id, status: IntakeStatus.PUBLISHED },
      relations: ['attachments', 'intakeSectors', 'intakeSectors.sector'],
    });

    if (!intake) {
      throw new NotFoundException(`Intake with ID ${id} not found`);
    }

    return this.toMarketplaceItem(intake);
  }

  async findMyIntakes(
    userId: string,
    query: QueryIntakeDto,
  ): Promise<PaginatedIntakeResult> {
    const { type, status, sectorId, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.intakeRepository
      .createQueryBuilder('intake')
      .leftJoinAndSelect('intake.attachments', 'attachments')
      .leftJoinAndSelect('intake.intakeSectors', 'intakeSectors')
      .leftJoinAndSelect('intakeSectors.sector', 'sector')
      .leftJoinAndSelect('intake.user', 'user')
      .where('intake.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('intake.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('intake.status = :status', { status });
    }

    if (sectorId) {
      queryBuilder.andWhere('sector.id = :sectorId', { sectorId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(intake.title ILIKE :search OR intake.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('intake.createdAt', 'DESC').skip(skip).take(limit);

    const [intakes, total] = await queryBuilder.getManyAndCount();

    // Compute totalByStatus from full (unfiltered) dataset for this user
    const countBuilder = this.intakeRepository
      .createQueryBuilder('intake')
      .where('intake.userId = :userId', { userId });

    if (type) {
      countBuilder.andWhere('intake.type = :type', { type });
    }
    if (sectorId) {
      countBuilder.andWhere(
        'intake.id IN (SELECT "intakeId" FROM "intake_sectors" WHERE "sectorId" = :sectorId)',
        { sectorId },
      );
    }
    if (search) {
      countBuilder.andWhere(
        '(intake.title ILIKE :search OR intake.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [draftCount, publishedCount] = await Promise.all([
      countBuilder
        .clone()
        .andWhere('intake.status = :draftStatus', {
          draftStatus: IntakeStatus.DRAFT,
        })
        .getCount(),
      countBuilder
        .clone()
        .andWhere('intake.status = :publishedStatus', {
          publishedStatus: IntakeStatus.PUBLISHED,
        })
        .getCount(),
    ]);

    return {
      data: intakes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalByStatus: { draft: draftCount, published: publishedCount },
    };
  }

  async findOneForUserCheck(id: string, userId: string): Promise<Intake> {
    const intake = await this.intakeRepository.findOne({
      where: { id, userId },
      relations: [
        'attachments',
        'intakeSectors',
        'intakeSectors.sector',
        'user',
      ],
    });

    if (!intake) {
      throw new NotFoundException(`Intake with ID ${id} not found`);
    }

    return intake;
  }

  private async attachUserIds(intakes: Intake[]): Promise<Intake[]> {
    const intakeIds = intakes.map((intake) => intake.id);
    if (intakeIds.length === 0) {
      return intakes;
    }

    const userIdResults = await this.intakeRepository.manager
      .createQueryBuilder()
      .select(['id', 'user_id'])
      .from('intakes', 'intake')
      .where('intake.id IN (:...ids)', { ids: intakeIds })
      .getRawMany();

    const userIdMap = userIdResults.reduce(
      (acc, row: { id: string; user_id: string | null }) => {
        acc[row.id] = row.user_id;
        return acc;
      },
      {} as Record<string, string | null>,
    );

    return intakes.map((intake) => ({
      ...intake,
      userId: userIdMap[intake.id] ?? null,
    })) as Intake[];
  }

  async updateByUser(
    id: string,
    updateIntakeDto: UpdateIntakeDto,
    files: Express.Multer.File[],
    userId: string,
    filesL2?: Express.Multer.File[],
    filesL3?: Express.Multer.File[],
    profilePicture?: Express.Multer.File,
  ): Promise<Intake> {
    // Check if intake exists and belongs to user
    await this.findOneForUserCheck(id, userId);
    return await this.update(
      id,
      updateIntakeDto,
      files,
      filesL2,
      filesL3,
      profilePicture,
    );
  }

  async removeByUser(id: string, userId: string): Promise<void> {
    // Check if intake exists and belongs to user
    const intake = await this.intakeRepository.findOne({
      where: { id, userId },
    });

    if (!intake) {
      throw new NotFoundException(`Intake with ID ${id} not found`);
    }

    // Hard delete - delete related records first, then the intake
    // Delete intake sectors
    await this.intakeSectorRepository.delete({ intakeId: id });
    // Delete attachments
    await this.attachmentRepository.delete({ intakeId: id });
    // Delete intake
    await this.intakeRepository.delete(id);
  }

  async update(
    id: string,
    updateIntakeDto: UpdateIntakeDto,
    files?: Express.Multer.File[],
    filesL2?: Express.Multer.File[],
    filesL3?: Express.Multer.File[],
    profilePicture?: Express.Multer.File,
  ): Promise<Intake> {
    const intake = await this.findOne(id);
    const { sectorIds, categoryId, ...restDto } = updateIntakeDto;

    Object.assign(intake, restDto);

    if (categoryId !== undefined) {
      intake.category = categoryId ? ({ id: categoryId } as Category) : null;
    }

    if (sectorIds !== undefined) {
      await this.updateSectorAssociations(id, sectorIds);
    }

    await this.intakeRepository.save(intake);

    // Only re-trigger pipeline if content changed AND aiProcessedContent was not
    // explicitly provided in the payload (caller-supplied value takes precedence).
    if (
      restDto.content !== undefined &&
      restDto.aiProcessedContent === undefined
    ) {
      await this.startAiProcessing(intake);
    }

    // Handle public file attachments (confidentialLevel = null)
    if (files && files.length > 0) {
      await this.saveAttachments(intake.id, files, null);
    }

    // Handle level 2 file attachments
    if (filesL2 && filesL2.length > 0) {
      await this.saveAttachments(intake.id, filesL2, ConfidentialLevel.LEVEL_2);
    }

    // Handle level 3 file attachments
    if (filesL3 && filesL3.length > 0) {
      await this.saveAttachments(intake.id, filesL3, ConfidentialLevel.LEVEL_3);
    }

    // Handle profile picture
    if (profilePicture) {
      await this.saveProfilePicture(intake.id, profilePicture);
    }

    return await this.findOne(id);
  }

  async uploadAttachment(
    id: string,
    file: Express.Multer.File,
    fileType: string,
    confidentialLevel: ConfidentialLevel | null = null,
  ): Promise<IntakeAttachment> {
    const intake = await this.findOne(id);

    const uploadedFile = await this.fileUploadService.uploadSingle(
      file,
      'intakes',
    );

    const attachment = this.attachmentRepository.create({
      intakeId: intake.id,
      fileName: uploadedFile.fileName,
      filePath: uploadedFile.url,
      fileType: fileType as IntakeAttachment['fileType'],
      mimeType: uploadedFile.mimeType,
      fileSize: uploadedFile.size,
      confidentialLevel,
    });

    return await this.attachmentRepository.save(attachment);
  }

  private async saveAttachments(
    intakeId: string,
    files: Express.Multer.File[],
    confidentialLevel: ConfidentialLevel | null,
  ): Promise<void> {
    const uploadedFiles = await this.fileUploadService.uploadMultiple(
      files,
      'intakes',
    );

    for (const uploadedFile of uploadedFiles) {
      const attachment = this.attachmentRepository.create({
        intakeId,
        fileName: uploadedFile.fileName,
        filePath: uploadedFile.url,
        fileType: IntakeAttachmentType.DOCUMENT,
        mimeType: uploadedFile.mimeType,
        fileSize: uploadedFile.size,
        confidentialLevel,
      });
      await this.attachmentRepository.save(attachment);
    }
  }

  private async saveProfilePicture(
    intakeId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    // Delete existing profile picture if any
    await this.attachmentRepository.delete({
      intakeId,
      fileType: IntakeAttachmentType.PROFILE_PICTURE,
    });

    const uploadedFile = await this.fileUploadService.uploadSingle(
      file,
      'intakes',
    );
    const attachment = this.attachmentRepository.create({
      intakeId,
      fileName: uploadedFile.fileName,
      filePath: uploadedFile.url,
      fileType: IntakeAttachmentType.PROFILE_PICTURE,
      mimeType: uploadedFile.mimeType,
      fileSize: uploadedFile.size,
      confidentialLevel: null,
    });
    await this.attachmentRepository.save(attachment);
  }

  async remove(id: string): Promise<void> {
    const intake = await this.intakeRepository.findOne({
      where: { id },
    });

    if (!intake) {
      throw new NotFoundException(`Intake with ID ${id} not found`);
    }

    await this.intakeSectorRepository.delete({ intakeId: id });
    await this.attachmentRepository.delete({ intakeId: id });
    await this.intakeRepository.delete(id);
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with ID ${attachmentId} not found`,
      );
    }

    await this.attachmentRepository.remove(attachment);
  }

  private async updateSectorAssociations(
    intakeId: string,
    sectorIds: string[],
  ): Promise<void> {
    // Remove existing associations
    await this.intakeSectorRepository.delete({ intakeId });

    // Add new associations
    if (sectorIds.length > 0) {
      const sectors = await this.sectorRepository.find({
        where: { id: In(sectorIds) },
      });

      const intakeSectors = sectors.map((sector) => {
        const intakeSector = new IntakeSector();
        intakeSector.intakeId = intakeId;
        intakeSector.sectorId = sector.id;
        return intakeSector;
      });

      await this.intakeSectorRepository.save(intakeSectors);
    }
  }

  async computeMatches(intakeId: string): Promise<number> {
    const intake = await this.intakeRepository.findOne({
      where: { id: intakeId },
    });
    if (!intake) return 0;

    if (!intake.content) return 0;

    const queryText = [intake.title, intake.content.substring(0, 1500)]
      .filter(Boolean)
      .join('\n');

    const sectorIds = intake.intakeSectors?.map((is) => is.sectorId) ?? [];
    const isIp = intake.type === IntakeType.IP;

    // "published" and "not my own" are now pushed INTO the query instead of
    // being applied to its result. Filtering afterwards meant a valid candidate
    // that happened to fall outside the first top-10 was discarded and could
    // never be recovered — the cut ran before the filter.
    const result = await this.searchService.searchForMatching({
      query: queryText,
      type: isIp ? IntakeType.CHALLENGE : IntakeType.IP,
      sectorIds: sectorIds.length ? sectorIds : undefined,
      // An intake with no owner excludes nobody.
      excludeUserId: intake.userId ?? undefined,
      limit: 10,
    });

    const filteredHits = result.hits;
    if (filteredHits.length === 0) return 0;

    // Upsert: delete existing matches for this intake then re-insert
    if (isIp) {
      await this.intakeMatchRepository.delete({ ipIntakeId: intakeId });
    } else {
      await this.intakeMatchRepository.delete({ challengeIntakeId: intakeId });
    }

    const rows = filteredHits.map((hit) =>
      this.intakeMatchRepository.create({
        ipIntakeId: isIp ? intakeId : hit.intakeId,
        challengeIntakeId: isIp ? hit.intakeId : intakeId,
        score: hit.score,
        matchedChunk: hit.matchedChunk,
        chunkIndex: hit.chunkIndex,
      }),
    );

    const saved = await this.intakeMatchRepository.save(rows);
    this.logger.log(
      `Computed ${saved.length} matches for intake ${intakeId} (${intake.type})`,
      IntakesService.name,
    );
    return saved.length;
  }

  async computeMatchesManual(
    intakeId: string,
    userId?: string,
  ): Promise<{ message: string }> {
    const intake = userId
      ? await this.findOneForUserCheck(intakeId, userId)
      : await this.intakeRepository.findOne({ where: { id: intakeId } });

    if (!intake) {
      throw new NotFoundException(`Intake with ID ${intakeId} not found`);
    }

    if (intake.status !== IntakeStatus.PUBLISHED) {
      throw new UnprocessableEntityException(
        `Intake ${intakeId} must be published before matching can be performed`,
      );
    }

    if (!intake.content) {
      throw new UnprocessableEntityException(
        `Intake ${intakeId} has no content to match`,
      );
    }

    await this.intakesQueue.add(IntakesJobName.COMPUTE_MATCHES, { intakeId });

    return { message: 'Matching has been queued' };
  }

  async findMatchingChallenges(
    intakeId: string,
    userId: string,
    limit: number,
    minScore: number,
  ) {
    const intake = await this.intakeRepository.findOne({
      where: { id: intakeId, userId },
      relations: ['intakeSectors'],
    });
    if (!intake) {
      throw new NotFoundException(`Intake with ID ${intakeId} not found`);
    }

    const queryText = [intake.title, (intake.content ?? '').substring(0, 1500)]
      .filter(Boolean)
      .join('\n');

    // Use sector IDs from this intake to filter results
    const sectorIds = intake.intakeSectors?.map((s) => s.sectorId) ?? [];

    return this.searchService.search({
      query: queryText,
      type: IntakeType.CHALLENGE,
      sectorIds: sectorIds.length ? sectorIds : undefined,
      // Same hard filters as the automatic path, pushed into the query.
      statuses: [IntakeStatus.PUBLISHED],
      excludeUserId: userId,
      limit,
      minScore,
    });
  }

  // Sector CRUD operations
  async findAllSectors(): Promise<Sector[]> {
    return await this.sectorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createSector(name: string): Promise<Sector> {
    const sector = this.sectorRepository.create({ name });
    return await this.sectorRepository.save(sector);
  }

  async updateSector(id: string, name: string): Promise<Sector> {
    const sector = await this.sectorRepository.findOne({ where: { id } });
    if (!sector) {
      throw new NotFoundException(`Sector with ID ${id} not found`);
    }
    sector.name = name;
    return await this.sectorRepository.save(sector);
  }

  async deleteSector(id: string): Promise<void> {
    const sector = await this.sectorRepository.findOne({ where: { id } });
    if (!sector) {
      throw new NotFoundException(`Sector with ID ${id} not found`);
    }
    await this.sectorRepository.remove(sector);
  }

  // Category CRUD operations
  async findAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createCategory(name: string): Promise<Category> {
    const category = this.categoryRepository.create({ name });
    return await this.categoryRepository.save(category);
  }

  async updateCategory(id: string, name: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    category.name = name;
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    await this.categoryRepository.remove(category);
  }

  async beautifyIntake(
    intakeId: string,
    userId?: string,
  ): Promise<{
    id: string;
    title: string;
    aiProcessTitle: string;
    aiProcessedContent: string;
    aiProcessingStatus: AiProcessingStatus;
  }> {
    const intake = userId
      ? await this.findOneForUserCheck(intakeId, userId)
      : await this.intakeRepository.findOne({ where: { id: intakeId } });

    if (!intake) {
      throw new NotFoundException(`Intake with ID ${intakeId} not found`);
    }

    if (!intake.content) {
      throw new UnprocessableEntityException(
        `Intake ${intakeId} has no content to beautify`,
      );
    }

    let result: { title: string; content: string };
    try {
      const prompt =
        intake.type === IntakeType.CHALLENGE
          ? buildB2bChallengePrompt(intake.title, intake.content)
          : buildB2bMarketingPrompt(intake.title, intake.content);
      const completion = await this.aiService.completion({ prompt });
      result = JSON.parse(completion.text) as {
        title: string;
        content: string;
      };
    } catch (error) {
      this.logger.error(
        `Beautify failed for intake ${intakeId}: ${String(error)}`,
        IntakesService.name,
      );
      throw new InternalServerErrorException(
        'AI beautification failed. Intake data was not modified.',
      );
    }

    await this.intakeRepository.update(intakeId, {
      aiProcessTitle: result.title,
      aiProcessedContent: result.content,
      aiProcessingStatus: AiProcessingStatus.COMPLETED,
    });

    // Auto-trigger computeMatches after beautify completes
    if (userId) {
      const userSettings = await this.userSettingsService.getSettings(userId);
      if (userSettings?.matchingAuto ?? true) {
        await this.intakesQueue.add(IntakesJobName.COMPUTE_MATCHES, {
          intakeId,
        });
      }
    }

    return {
      id: intake.id,
      title: intake.title,
      aiProcessTitle: result.title,
      aiProcessedContent: result.content,
      aiProcessingStatus: AiProcessingStatus.COMPLETED,
    };
  }
}
