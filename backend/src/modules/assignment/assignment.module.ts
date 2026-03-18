import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './domain/entity/assignment.entity';
import { Subject } from '../subject/domain/entities/subject.entity';
import { AssignmentController } from './presentation/assignment.controller';
import { AssignmentService } from './domain/assignment.service';
import { Module } from '@nestjs/common';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { SubjectModule } from '../subject/subject.module';
import { BranchModule } from '../branch/branch.module';
import { EnumsModule } from '../enums/enums.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { AssignmentRepository } from './data/repository';

@Module({
  imports: [
    FileUploadModule,
    SubjectModule,
    BranchModule,
    EnumsModule,
    AuthModule,
    TypeOrmModule.forFeature([Subject, Assignment, File]),
  ],
  controllers: [AssignmentController],
  providers: [
    AssignmentService,
    AssignmentRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AssignmentService],
})
export class AssignmentModule {}
