import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSetting } from '../user-setting.entity';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSetting)
    private readonly userSettingRepository: Repository<UserSetting>,
  ) {}

  async getSettings(userId: string): Promise<UserSetting> {
    let settings = await this.userSettingRepository.findOne({
      where: { userId },
    });
    if (!settings) {
      settings = this.userSettingRepository.create({ userId });
      await this.userSettingRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(
    userId: string,
    dto: UpdateSettingsDto,
  ): Promise<UserSetting> {
    let settings = await this.userSettingRepository.findOne({
      where: { userId },
    });
    if (!settings) {
      settings = this.userSettingRepository.create({ userId });
    }
    if (dto.matchingAuto !== undefined) {
      settings.matchingAuto = dto.matchingAuto;
    }
    return this.userSettingRepository.save(settings);
  }
}
