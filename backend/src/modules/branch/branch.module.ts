import { Module } from '@nestjs/common';
import { BranchController } from './presentation/branch.controller';
import { BranchService } from './domain/branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './domain/entities/branch.entity';
import { BranchRepository } from './data/repositories/repository';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchController],
  providers: [BranchService, BranchRepository, JwtAuthGuard, RolesGuard],
  exports: [BranchService],
})
export class BranchModule {}
