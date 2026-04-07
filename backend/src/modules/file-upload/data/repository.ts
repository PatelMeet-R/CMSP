import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../domain/entity/file.entity';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}
  async findAll(): Promise<File[]> {
    return await this.fileRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
  async save(data: File): Promise<File> {
    return await this.fileRepository.save(data);
  }
  async findFileById(id: number): Promise<File | null> {
    return await this.fileRepository.findOne({ where: { id } });
  }
  async RemoveFileEntity(entity: File): Promise<void> {
    await this.fileRepository.remove(entity);
  }
}
