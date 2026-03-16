import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessorSubMapping } from '../../domain/entities/professors-subject.entity';

@Injectable()
export class ProfessorSubMappingRepository {
  constructor(
    @InjectRepository(ProfessorSubMapping)
    private readonly repo: Repository<ProfessorSubMapping>,
  ) {}
  async saveAssignedSubject(data: ProfessorSubMapping) {
    return this.repo.save(data);
  }
  async findExisting(
    professorId: number,
    subjectId: number,
    semesterId: number,
    yearId: number,
  ) {
    return this.repo.findOne({
      where: {
        professor: { id: professorId },
        subject: { id: subjectId },
        semester: { id: semesterId },
        academicYear: { id: yearId },
      },
    });
  }
  async findAssignSubjectByIdWithRelations(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: [
        'professor',
        'professor.personalInfo',
        'subject',
        'semester',
        'academicYear',
        'assignedBy',
        'assignedBy.personalInfo',
      ],
    });
  }
  async findAssignSubjectByProfessorId(professorId: number) {
    return this.repo
      .createQueryBuilder('mapping')
      .leftJoinAndSelect('mapping.subject', 'subject')
      .leftJoinAndSelect('mapping.semester', 'semester')
      .leftJoinAndSelect('mapping.academicYear', 'academicYear')
      .where('mapping.professorId = :professorId', { professorId })
      .getMany();
  }
  async findAllAssignSubjectDetails() {
    return this.repo
      .createQueryBuilder('mapping')
      .leftJoinAndSelect('mapping.professor', 'professor')
      .leftJoinAndSelect('professor.personalInfo', 'pinfo')
      .leftJoinAndSelect('mapping.subject', 'subject')
      .leftJoinAndSelect('mapping.semester', 'semester')
      .leftJoinAndSelect('mapping.academicYear', 'academicYear')
      .getMany();
  }
}
