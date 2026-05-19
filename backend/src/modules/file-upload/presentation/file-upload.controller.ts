import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from '../domain/file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { FileResponse } from '../data/mapper/file.response';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('file:upload', 'profile:update-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        // This ensures the file is required and valid
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
          new FileTypeValidator({
            fileType:
              /(image\/(png|jpeg|jpg)|application\/(pdf|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|msword))/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('folder') folder: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<any> {
    const res = await this.fileUploadService.uploadFile(file, user.id, folder);
    return {
      data: FileResponse.toResponseDto(res),
    };
  }

  @Get()
  @Permissions('file:read-all')
  async allFile() {
    const res = await this.fileUploadService.findAllFile();
    return {
      data: res,
    };
  }

  @Delete(':id')
  @Permissions('file:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: UserResponseDto) {
    await this.fileUploadService.remove(id, user);
    return {
      message: 'File delete successfully',
    };
  }
}
