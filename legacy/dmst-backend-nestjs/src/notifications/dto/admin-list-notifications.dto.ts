import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListNotificationsDto } from './list-notifications.dto';

export class AdminListNotificationsDto extends ListNotificationsDto {
  @ApiPropertyOptional({ description: 'Filter by recipient user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
