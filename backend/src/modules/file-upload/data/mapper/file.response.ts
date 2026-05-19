import { File as FileEntity } from '../../domain/entity/file.entity';
import { FileResponseDto } from '../../presentation/dto/response/file-response.dto';

export class FileResponse {
  static toResponseDto(entity: FileEntity): FileResponseDto {
    const dto = new FileResponseDto();
    dto.id = entity.id;
    dto.originalName = entity.originalName;
    dto.url = entity.url;
    dto.mimeType = entity.mimeType;
    dto.size = entity.size;
    dto.createdAt = entity.createdAt;

    return dto;
  }
  static toResponseDtoArray(entities: FileEntity[]): FileResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }
}
