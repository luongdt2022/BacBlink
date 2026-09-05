import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
