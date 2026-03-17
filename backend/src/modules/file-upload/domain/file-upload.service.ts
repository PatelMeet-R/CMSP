import { Injectable, NotFoundException } from '@nestjs/common';
import { File } from './entity/file.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { FileRepository } from '../data/repository';
import { FileCreateMapper } from '../data/mapper/file-create.mapper';

@Injectable()
export class FileUploadService {
  constructor(
    // private readonly fileRepository: Repository<File>,
    private readonly fileRepository: FileRepository,

    private readonly CloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(file: Express.Multer.File, userId: number): Promise<File> {
    const cloudinaryResponse = await this.CloudinaryService.uploadFile(file);
    const newlyCreatedFile = FileCreateMapper.toCreateEntity(
      file,
      cloudinaryResponse,
      userId,
    );
    return await this.fileRepository.save(newlyCreatedFile);
  }

  async remove(id: number): Promise<void> {
    const fileToBeDeleted = await this.fileRepository.findFileById(id);
    if (!fileToBeDeleted) {
      throw new NotFoundException(
        ERRORMESSAGE.DATA_NOT_FOUND(`file with ID ${id}`),
      );
    }
    //delete from cloudinary
    await this.CloudinaryService.deleteFile(fileToBeDeleted.publicId);
    //delete from database

    await this.fileRepository.RemoveFileEntity(fileToBeDeleted);
  }
  async findAllFile(): Promise<File[]> {
    return await this.fileRepository.findAll();
  }
}
