import { Module } from '@nestjs/common';
import { SubjectController } from './presentation/controllers/subject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../branch/domain/entities/branch.entity';
import { EnumValue } from '../enums/domain/entities/enumValue.entity';

import { SubjectRepository } from './data/repositories/repository';
import { Subject } from './domain/entities/subject.entity';
import { User } from '../auth/domain/entities/user.entity';
import { SubjectService } from './domain/services/subject.service';
import { ProfessorSubMappingController } from './presentation/controllers/professor-subjects.controller';
import { ProfessorSubMappingService } from './domain/services/professor-subject-mapping.service';
import { ProfessorSubMappingRepository } from './data/repositories/professor-subject-mapping-repository';
import { BranchModule } from '../branch/branch.module';
import { EnumsModule } from '../enums/enums.module';
import { AuthModule } from '../auth/auth.module';
import { ProfessorSubMapping } from './domain/entities/professors-subject.entity';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    BranchModule,
    EnumsModule,
    TypeOrmModule.forFeature([
      Subject,
      Branch,
      EnumValue,
      User,
      ProfessorSubMapping,
    ]),
  ],
  controllers: [SubjectController, ProfessorSubMappingController],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    SubjectService,
    SubjectRepository,
    ProfessorSubMappingService,
    ProfessorSubMappingRepository,
  ],
  exports: [ProfessorSubMappingService, SubjectService],
})
export class SubjectModule {}
