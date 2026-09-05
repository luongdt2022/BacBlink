import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminUsersService } from '../services/admin-users.service';
import { CollaborationsService } from '../../collaborations/collaborations.service';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { User } from '../user.entity';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly collaborationsService: CollaborationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.adminUsersService.create(dto);
    const { password, ...result } = user;
    void password;
    return result as Omit<User, 'password'>;
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  async findAll(@Query() query: ListUsersQueryDto) {
    return this.adminUsersService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      search: query.search,
      status: query.status ?? 'all',
    });
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get user profile with intakes' })
  async getProfile(@Param('id') id: string) {
    return this.adminUsersService.getUserProfile(id);
  }

  @Get(':id/collaboration-history')
  @ApiOperation({ summary: 'Get collaboration request history for a user' })
  async getCollaborationHistory(@Param('id') id: string) {
    return this.collaborationsService.findByUserIdAdmin(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  async findOne(@Param('id') id: string): Promise<Omit<User, 'password'>> {
    const user = await this.adminUsersService.findById(id);
    const { password, ...result } = user;
    void password;
    return result as Omit<User, 'password'>;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.adminUsersService.update(id, dto);
    const { password, ...result } = user;
    void password;
    return result as Omit<User, 'password'>;
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    await this.adminUsersService.resetPassword(id, body.newPassword);
    return { message: 'Password reset successfully' };
  }
}
