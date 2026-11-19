import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Story, StoryStatus } from './story.entity';
import { UserRole } from '../users/user.entity';
import {
  CreateStoryDto,
  QueryPublicStoryDto,
  QueryStoryDto,
  StorySource,
  UpdateStoryDto,
} from './dto/story.dto';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
  ) {}

  async findAll(query: QueryStoryDto, authorId?: string) {
    const { page = 1, limit = 20, type, status } = query;
    const qb = this.storyRepository
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.author', 'author')
      .orderBy('story.createdAt', 'DESC');

    if (authorId) {
      qb.andWhere('story.authorId = :authorId', { authorId });
    } else {
      // Public: only published + not hidden
      qb.andWhere('story.status = :status', { status: StoryStatus.PUBLISHED });
      qb.andWhere('story.isHidden = false');
    }

    if (type) qb.andWhere('story.type = :type', { type });
    if (status && authorId) qb.andWhere('story.status = :status', { status });

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findMine(authorId: string, query: QueryStoryDto) {
    return this.findAll(query, authorId);
  }

  async findAllAdmin(query: QueryStoryDto) {
    const { page = 1, limit = 20, type, status } = query;
    const qb = this.storyRepository
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.author', 'author')
      .orderBy('story.createdAt', 'DESC');

    if (type) qb.andWhere('story.type = :type', { type });
    if (status) qb.andWhere('story.status = :status', { status });

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Story> {
    const story = await this.storyRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!story) throw new NotFoundException('Câu chuyện không tồn tại');
    return story;
  }

  async create(dto: CreateStoryDto, authorId: string): Promise<Story> {
    const story = this.storyRepository.create({ ...dto, authorId });
    return this.storyRepository.save(story);
  }

  async update(
    id: string,
    dto: UpdateStoryDto,
    requesterId: string,
    isAdmin = false,
  ): Promise<Story> {
    const story = await this.findOne(id);
    if (!isAdmin && story.authorId !== requesterId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa câu chuyện này',
      );
    }
    Object.assign(story, dto);
    return this.storyRepository.save(story);
  }

  async remove(
    id: string,
    requesterId: string,
    isAdmin = false,
  ): Promise<void> {
    const story = await this.findOne(id);
    if (!isAdmin && story.authorId !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền xóa câu chuyện này');
    }
    await this.storyRepository.remove(story);
  }

  async toggleVisibility(id: string, isHidden: boolean): Promise<Story> {
    const story = await this.findOne(id);
    story.isHidden = isHidden;
    return this.storyRepository.save(story);
  }

  async findPublic(query: QueryPublicStoryDto) {
    const { page = 1, limit = 10, source = StorySource.ALL } = query;
    const qb = this.storyRepository
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.author', 'author')
      .where('story.status = :status', { status: StoryStatus.PUBLISHED })
      .andWhere('story.isHidden = false')
      .orderBy('story.createdAt', 'DESC');

    if (source === StorySource.USER) {
      qb.andWhere('author.role = :role', { role: UserRole.USER });
    } else if (source === StorySource.ADMIN) {
      qb.andWhere('author.role = :role', { role: UserRole.ADMIN });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }
}
