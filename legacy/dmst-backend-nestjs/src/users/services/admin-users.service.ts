import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../user.entity';
import { Intake, IntakeType } from '../../intakes/intake.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Intake)
    private readonly intakeRepo: Repository<Intake>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password ?? '12345678', 10);

    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      phone: dto.phone ?? null,
      organization: dto.organization ?? null,
      role: UserRole.USER,
      isActive: true,
    });

    return this.userRepo.save(user);
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: 'all' | 'active' | 'inactive';
  }) {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.organization',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt',
      ])
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      const s = `%${search.trim()}%`;
      qb.andWhere(
        `(LOWER(user.firstName) LIKE LOWER(:s) OR LOWER(user.lastName) LIKE LOWER(:s) OR LOWER(user.email) LIKE LOWER(:s) OR LOWER(user.organization) LIKE LOWER(:s))`,
        { s },
      );
    }

    if (status === 'active') {
      qb.andWhere('user.isActive = :isActive', { isActive: true });
    } else if (status === 'inactive') {
      qb.andWhere('user.isActive = :isActive', { isActive: false });
    }

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.organization !== undefined) user.organization = dto.organization;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    return this.userRepo.save(user);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    user.password = await bcrypt.hash(newPassword, 10);
    user.previousPasswordHash = null;
    await this.userRepo.save(user);
  }

  async getUserProfile(id: string) {
    const user = await this.findById(id);

    const intakes = await this.intakeRepo
      .createQueryBuilder('intake')
      .leftJoinAndSelect('intake.category', 'category')
      .where('intake.userId = :id', { id })
      .andWhere('intake.deletedAt IS NULL')
      .orderBy('intake.createdAt', 'DESC')
      .getMany();

    const mapIntake = (intake: Intake) => ({
      id: intake.id,
      title: intake.title,
      status: intake.status,
      category: intake.category?.name ?? null,
      createdAt: intake.createdAt,
    });

    const { password, previousPasswordHash, ...userInfo } = user;
    void password;
    void previousPasswordHash;

    return {
      user: userInfo,
      ipIntakes: intakes.filter((i) => i.type === IntakeType.IP).map(mapIntake),
      challengeIntakes: intakes
        .filter((i) => i.type === IntakeType.CHALLENGE)
        .map(mapIntake),
    };
  }
}
