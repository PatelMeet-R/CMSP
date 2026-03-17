import { File as FileEntity } from '../../domain/entity/file.entity';
import { UploadApiResponse } from 'cloudinary';

export class FileCreateMapper {
  static toCreateEntity(
    file: Express.Multer.File,
    cloudinaryResponse: UploadApiResponse,
    userId: number,
  ): FileEntity {
    const entity = new FileEntity();
    entity.originalName = file.originalname;
    entity.mimeType = file.mimetype;
    entity.size = file.size;
    entity.publicId = cloudinaryResponse.public_id;
    entity.url = cloudinaryResponse.secure_url;
    entity.createdBy = userId;

    return entity;
  }
}
