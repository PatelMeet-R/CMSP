import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnumType } from './domain/entities/enumType.entity';
import { EnumValue } from './domain/entities/enumValue.entity';
import { EnumRepository } from './data/repositories/repository';
import { EnumService } from './domain/enums.service';
import { EnumController } from './presentation/enums.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EnumType, EnumValue])],
  providers: [EnumRepository, EnumService],
  controllers: [EnumController],
  exports: [EnumService],
})
export class EnumsModule {}
