import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hasPermission } from 'src/common/utils/permissions/permission.utils';
import { File } from './entity/file.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { FileRepository } from '../data/repository';
import { FileCreateMapper } from '../data/mapper/file-create.mapper';
import { FileResponseDto } from '../presentation/dto/response/file-response.dto';
import { FileResponse } from '../data/mapper/file.response';
import type { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileRepository: FileRepository,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    folder: string,
  ): Promise<File> {
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(
      file,
      folder,
    );
    const newlyCreatedFile = FileCreateMapper.toCreateEntity(
      file,
      cloudinaryResponse,
      userId,
    );
    return await this.fileRepository.save(newlyCreatedFile);
  }

  async remove(id: string, currentUser: UserResponseDto): Promise<void> {
    const fileToBeDeleted = await this.fileRepository.findFileById(id);
    if (!fileToBeDeleted) {
      throw new NotFoundException(
        ERRORMESSAGE.DATA_NOT_FOUND(`file with ID ${id}`),
      );
    }
    const isOwner = fileToBeDeleted.createdBy === currentUser.id;
    const canDeleteGlobal = hasPermission(
      currentUser.permissions,
      'file:manage-global',
    );

    if (!isOwner && !canDeleteGlobal) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own uploaded files.',
      );
    }

    //delete from cloudinary
    await this.cloudinaryService.deleteFile(fileToBeDeleted.publicId);
    //delete from database

    await this.fileRepository.RemoveFileEntity(fileToBeDeleted);
  }
  async findAllFile(): Promise<FileResponseDto[]> {
    const fileDetails: File[] = await this.fileRepository.findAll();
    if (!fileDetails.length) {
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('files'));
    }
    return FileResponse.toResponseDtoArray(fileDetails);
  }
  async findFileEntityById(id: string): Promise<File | undefined> {
    const file = await this.fileRepository.findFileById(id);
    return file ?? undefined;
  }
  async systemRemove(id: string): Promise<void> {
    const fileToBeDeleted = await this.fileRepository.findFileById(id);
    if (fileToBeDeleted) {
      await this.cloudinaryService.deleteFile(fileToBeDeleted.publicId);
      await this.fileRepository.RemoveFileEntity(fileToBeDeleted);
    }
  }
}
