import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { StatsQueryDto } from './dto/stats.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@ApiTags('Admin Stats')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('intakes')
  @ApiOperation({ summary: 'Get aggregate intake statistics' })
  async getIntakeStats(@Query() query: StatsQueryDto) {
    const data = await this.statsService.getIntakeStats(query.days ?? 30);
    return { success: true, data };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get aggregate user statistics' })
  async getUserStats(@Query() query: StatsQueryDto) {
    const data = await this.statsService.getUserStats(query.days ?? 30);
    return { success: true, data };
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notification statistics broken down by type' })
  async getNotificationStats(@Query() query: StatsQueryDto) {
    const data = await this.statsService.getNotificationStats(query.days ?? 30);
    return { success: true, data };
  }
}
