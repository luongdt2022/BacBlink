import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { IntakesService } from './intakes.service';
import {
  CreateIntakeDto,
  FindMatchesQueryDto,
  MatchesQueryDto,
  UpdateIntakeDto,
  QueryIntakeDto,
} from './dto/intake.dto';
import { IntakeAttachment } from './index';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Intakes - User')
@Controller('intakes')
export class UserIntakesController {
  constructor(private readonly intakesService: IntakesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all intakes (public)' })
  @ApiQuery({ name: 'type', required: false, enum: ['ip', 'challenge'] })
  @ApiQuery({ name: 'sectorId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Intakes retrieved successfully' })
  async findAll(@Query() query: QueryIntakeDto) {
    const result = await this.intakesService.findAllForUser(query);
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get an intake by ID (public)' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Intake retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ) {
    const intake = await this.intakesService.findOneForUser(id, user?.id);
    return { success: true, data: intake };
  }

  @Get(':id/matches')
  @ApiOperation({ summary: 'Get paginated matches for an intake (public)' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  async findMatches(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MatchesQueryDto,
  ) {
    const result = await this.intakesService.findMatches(
      id,
      query.page ?? 1,
      query.limit ?? 20,
    );
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}

@ApiTags('My Intakes - User')
@Controller('my/intakes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MyIntakesController {
  constructor(private readonly intakesService: IntakesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new intake (authenticated user)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Intake title' },
        content: { type: 'string', description: 'Intake content/description' },
        aiProcessedContent: {
          type: 'string',
          description: 'AI processed content',
        },
        type: {
          type: 'string',
          enum: ['ip', 'challenge'],
          description: 'Type of intake',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'Status of intake',
        },
        sectorIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of sector UUIDs',
        },
        confidentialLevel2Content: {
          type: 'string',
          description: 'Confidential level 2 content',
        },
        confidentialLevel2AiProcessedContent: {
          type: 'string',
          description: 'Confidential level 2 AI processed content',
        },
        confidentialLevel3Content: {
          type: 'string',
          description: 'Confidential level 3 content',
        },
        confidentialLevel3AiProcessedContent: {
          type: 'string',
          description: 'Confidential level 3 AI processed content',
        },
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (image only)',
        },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Public attachment files (max 10)',
        },
        confidentialLevel2Attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Confidential level 2 attachment files (max 10)',
        },
        confidentialLevel3Attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Confidential level 3 attachment files (max 10)',
        },
      },
      required: ['title'],
    },
  })
  @ApiResponse({ status: 201, description: 'Intake created successfully' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePicture', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
        { name: 'confidentialLevel2Attachments', maxCount: 10 },
        { name: 'confidentialLevel3Attachments', maxCount: 10 },
      ],
      {
        storage: memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      },
    ),
  )
  async create(
    @Body() createIntakeDto: CreateIntakeDto,
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
      confidentialLevel2Attachments?: Express.Multer.File[];
      confidentialLevel3Attachments?: Express.Multer.File[];
    },
  ) {
    const intake = await this.intakesService.create(
      createIntakeDto,
      files?.attachments || [],
      user.id,
      files?.confidentialLevel2Attachments,
      files?.confidentialLevel3Attachments,
      files?.profilePicture?.[0],
    );
    return { success: true, data: intake };
  }

  @Get('discover')
  @ApiOperation({
    summary: 'Get published intakes from other users for discovery',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['ip', 'challenge'] })
  @ApiQuery({ name: 'sectorId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Discoverable intakes retrieved successfully',
  })
  async findDiscoverableIntakes(
    @Query() query: QueryIntakeDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.intakesService.findDiscoverableIntakes(
      user.id,
      query,
    );
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get current user intakes' })
  @ApiQuery({ name: 'type', required: false, enum: ['ip', 'challenge'] })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published'] })
  @ApiQuery({ name: 'sectorId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'My intakes retrieved successfully',
  })
  async findMyIntakes(
    @Query() query: QueryIntakeDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.intakesService.findMyIntakes(user.id, query);
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      totalByStatus: result.totalByStatus,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get current user intake by ID' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Intake retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  async findMyIntake(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const intake = await this.intakesService.findOneForUserCheck(id, user.id);
    return { success: true, data: intake };
  }

  @Get(':id/matches')
  @ApiOperation({ summary: 'Get paginated pre-computed matches for an intake' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  async findMatches(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MatchesQueryDto,
    @CurrentUser() user: User,
  ) {
    await this.intakesService.findOneForUserCheck(id, user.id);
    const result = await this.intakesService.findMatches(
      id,
      query.page ?? 1,
      query.limit ?? 20,
    );
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id/find-challenges')
  @ApiOperation({
    summary:
      'Find matching buyer challenges for an IP intake (seller perspective)',
    description:
      'Given a seller IP intake, find buyer challenges in the same sectors using semantic search.',
  })
  @ApiParam({ name: 'id', description: 'IP Intake UUID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Matching challenges found' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  async findMatchingChallenges(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FindMatchesQueryDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.intakesService.findMatchingChallenges(
      id,
      user.id,
      query.limit ?? 10,
      query.minScore ?? 0,
    );
    return { success: true, data: result };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update current user intake' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Intake title' },
        content: { type: 'string', description: 'Intake content/description' },
        aiProcessedContent: {
          type: 'string',
          description: 'AI processed content',
        },
        type: {
          type: 'string',
          enum: ['ip', 'challenge'],
          description: 'Type of intake',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'Status of intake',
        },
        sectorIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of sector UUIDs',
        },
        confidentialLevel2Content: {
          type: 'string',
          description: 'Confidential level 2 content',
        },
        confidentialLevel2AiProcessedContent: {
          type: 'string',
          description: 'Confidential level 2 AI processed content',
        },
        confidentialLevel3Content: {
          type: 'string',
          description: 'Confidential level 3 content',
        },
        confidentialLevel3AiProcessedContent: {
          type: 'string',
          description: 'Confidential level 3 AI processed content',
        },
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (image only)',
        },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Public attachment files to add (max 10)',
        },
        confidentialLevel2Attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Confidential level 2 attachment files to add (max 10)',
        },
        confidentialLevel3Attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Confidential level 3 attachment files to add (max 10)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Intake updated successfully' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePicture', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
        { name: 'confidentialLevel2Attachments', maxCount: 10 },
        { name: 'confidentialLevel3Attachments', maxCount: 10 },
      ],
      {
        storage: memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      },
    ),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIntakeDto: UpdateIntakeDto,
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
      confidentialLevel2Attachments?: Express.Multer.File[];
      confidentialLevel3Attachments?: Express.Multer.File[];
    },
  ) {
    const intake = await this.intakesService.updateByUser(
      id,
      updateIntakeDto,
      files?.attachments || [],
      user.id,
      files?.confidentialLevel2Attachments,
      files?.confidentialLevel3Attachments,
      files?.profilePicture?.[0],
    );
    return { success: true, data: intake };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete current user intake' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Intake deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string }> {
    await this.intakesService.removeByUser(id, user.id);
    return { success: true, message: 'Intake deleted successfully' };
  }

  @Post(':id/beautify')
  @ApiOperation({
    summary: 'Run AI beautification on intake and save result',
  })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Beautified intake data' })
  async beautify(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.intakesService.beautifyIntake(id, user.id);
    return { success: true, data };
  }

  @Post(':id/compute-matches')
  @ApiOperation({
    summary: 'Manually trigger matching for a published intake',
  })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Matching completed successfully' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  @ApiResponse({
    status: 422,
    description: 'Intake must be published to trigger matching',
  })
  async computeMatches(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.intakesService.computeMatchesManual(id, user.id);
    return { success: true, data };
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload attachment to current user intake' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        fileType: {
          type: 'string',
          enum: ['image', 'video', 'document'],
          description: 'Type of file',
        },
      },
      required: ['file', 'fileType'],
    },
  })
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; data: IntakeAttachment }> {
    // Verify ownership
    await this.intakesService.findOneForUserCheck(id, user.id);
    const attachment = await this.intakesService.uploadAttachment(
      id,
      file,
      fileType,
    );
    return { success: true, data: attachment };
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete an attachment from current user intake' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment UUID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async deleteAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string }> {
    // Verify ownership
    await this.intakesService.findOneForUserCheck(id, user.id);
    await this.intakesService.deleteAttachment(attachmentId);
    return { success: true, message: 'Attachment deleted successfully' };
  }
}

@ApiTags('Marketplace - User')
@Controller('marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketplaceController {
  constructor(private readonly intakesService: IntakesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get marketplace intakes (public fields only, no confidential data)',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['ip', 'challenge'] })
  @ApiQuery({ name: 'sectorId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Marketplace intakes retrieved successfully',
  })
  async findMarketplaceIntakes(
    @Query() query: QueryIntakeDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.intakesService.findMarketplaceIntakes(
      user.id,
      query,
    );
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Get marketplace intake detail (public fields only, no confidential data)',
  })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Intake retrieved successfully' })
  @ApiResponse({
    status: 404,
    description: 'Intake not found or not published',
  })
  async findMarketplaceIntakeById(@Param('id', ParseUUIDPipe) id: string) {
    const intake = await this.intakesService.findMarketplaceIntakeById(id);
    return { success: true, data: intake };
  }
}

@ApiTags('Sectors - User')
@Controller('sectors')
export class UserSectorsController {
  constructor(private readonly intakesService: IntakesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sectors (public)' })
  @ApiResponse({ status: 200, description: 'Sectors retrieved successfully' })
  async findAll() {
    return { success: true, data: await this.intakesService.findAllSectors() };
  }
}

@ApiTags('Categories - User')
@Controller('categories')
export class UserCategoriesController {
  constructor(private readonly intakesService: IntakesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories (public)' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll() {
    return {
      success: true,
      data: await this.intakesService.findAllCategories(),
    };
  }
}
