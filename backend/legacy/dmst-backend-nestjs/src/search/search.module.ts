import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntakeChunk } from '../intakes/intake-chunk.entity';
import { Intake } from '../intakes/intake.entity';
import { IntakeSector } from '../intakes/intake-sector.entity';
import { Sector } from '../intakes/sector.entity';
import { AiModule } from '../ai/ai.module';
import { PgVectorService } from './pgvector.service';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Intake, IntakeChunk, IntakeSector, Sector]),
    AiModule,
  ],
  providers: [PgVectorService, SearchService],
  controllers: [SearchController],
  exports: [PgVectorService, SearchService],
})
export class SearchModule {}
