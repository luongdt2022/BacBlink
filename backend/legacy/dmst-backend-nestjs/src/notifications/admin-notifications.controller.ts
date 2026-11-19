import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { NotificationsService } from './notifications.service';
import { AdminListNotificationsDto } from './dto/admin-list-notifications.dto';

@ApiTags('Notifications - Admin')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all notifications (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async findAll(@Query() dto: AdminListNotificationsDto) {
    const result = await this.notificationsService.findAllAdmin(dto);
    return { success: true, data: result };
  }
}
