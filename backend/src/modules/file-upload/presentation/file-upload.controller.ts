import {
  BadRequestException,
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
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from '../domain/file-upload.service';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { FileResponse } from '../data/mapper/file.response';
import { Roles } from 'src/core/decorators/roles.decorators';
import { ROLES } from 'src/common/constants/roles.constant';
import { RolesGuard } from 'src/core/guards/roles-guard';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        // This ensures the file is required and valid
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf|docx)' }),
        ],
      }),
    )
    @UploadedFile()
    file: Express.Multer.File,
    // @Body() uploadfileDto :UploadFileDto,
    @Body('folder') folder: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<any> {
    const res = await this.fileUploadService.uploadFile(file, user.id);
    return {
      data: FileResponse.toResponseDto(res),
    };
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async allFile() {
    const res = await this.fileUploadService.findAllFile();
    return {
      data: res,
    };
  }
  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.fileUploadService.remove(id);
    return {
      message: 'File delete successfully',
    };
  }
}
