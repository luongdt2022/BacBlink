import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../user.entity';
import { UserSettingsService } from '../services/user-settings.service';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@ApiTags('User Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('my/settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user settings' })
  getSettings(@CurrentUser() user: User) {
    return this.userSettingsService.getSettings(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user settings' })
  updateSettings(@CurrentUser() user: User, @Body() dto: UpdateSettingsDto) {
    return this.userSettingsService.updateSettings(user.id, dto);
  }
}
