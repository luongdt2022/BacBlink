import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  INTAKES_QUEUE_NAME,
  IntakesJobName,
} from '../constants/intakes.constants';
import { IntakesService } from '../intakes.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Processor(INTAKES_QUEUE_NAME)
export class IntakesProcessor extends WorkerHost {
  private readonly logger = new Logger(IntakesProcessor.name);

  constructor(
    private readonly intakesService: IntakesService,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<{ intakeId: string }>): Promise<void> {
    this.logger.log(
      `[START] job=${job.name} id=${job.id} intakeId=${job.data.intakeId}`,
    );

    switch (job.name as IntakesJobName) {
      case IntakesJobName.COMPUTE_MATCHES: {
        const matchCount = await this.intakesService.computeMatches(
          job.data.intakeId,
        );
        if (matchCount > 0) {
          await this.notificationsService.createMatchFoundNotification({
            intakeId: job.data.intakeId,
            matchCount,
          });
        }
        break;
      }
      default:
        throw new Error(`Unknown intakes job: ${job.name}`);
    }

    this.logger.log(`[DONE] job=${job.name} id=${job.id}`);
  }
}
