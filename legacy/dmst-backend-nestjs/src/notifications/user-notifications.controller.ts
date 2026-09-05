import {
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { NotificationsService } from './notifications.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';

@ApiTags('Notifications - User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('my/notifications')
export class UserNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List personal notifications (newest first)' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async findAll(@Query() dto: ListNotificationsDto, @CurrentUser() user: User) {
    const result = await this.notificationsService.findAllForUser(user.id, dto);
    return { success: true, data: result };
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count (for header badge polling)',
  })
  @ApiResponse({ status: 200, description: 'Unread count returned' })
  async getUnreadCount(@CurrentUser() user: User) {
    const data = await this.notificationsService.getUnreadCount(user.id);
    return { success: true, data };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all personal notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllRead(@CurrentUser() user: User) {
    const data = await this.notificationsService.markAllRead(user.id);
    return { success: true, data };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markOneRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.notificationsService.markOneRead(id, user.id);
    return { success: true, data };
  }

  @Delete('all')
  @ApiOperation({ summary: 'Delete all personal notifications (clear inbox)' })
  @ApiResponse({ status: 200, description: 'All notifications deleted' })
  async deleteAll(@CurrentUser() user: User) {
    const data = await this.notificationsService.deleteAll(user.id);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a single notification' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.notificationsService.deleteOne(id, user.id);
    return { success: true, data };
  }
}
