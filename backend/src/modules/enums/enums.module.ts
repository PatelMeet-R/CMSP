import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnumService } from './domain/service/enums.service';
import { EnumController } from './presentation/controller/enums.controller';
import { EnumType } from './domain/entities/enumType.entity';
import { EnumValue } from './domain/entities/enumValue.entity';
import { EnumRepository } from './data/repositories/repository';

@Module({
  imports: [TypeOrmModule.forFeature([EnumType, EnumValue])],
  providers: [EnumRepository, EnumService],
  controllers: [EnumController],
  exports: [EnumService],
})
export class EnumsModule {}
