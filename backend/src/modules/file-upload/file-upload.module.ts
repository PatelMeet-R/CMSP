import { Module } from '@nestjs/common';
import { FileUploadService } from './domain/file-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './domain/entity/file.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileUploadController } from './presentation/file-upload.controller';
import { FileRepository } from './data/repository';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    CloudinaryModule,
    MulterModule.register({
      storage: memoryStorage,
    }),
  ],
  controllers: [FileUploadController],
  providers: [
    FileUploadService,
    CloudinaryProvider,
    CloudinaryService,
    FileRepository,
  ],
  exports: [TypeOrmModule, FileRepository],
})
export class FileUploadModule {}
