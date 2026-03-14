import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from '../../domain/entities/subject.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class SubjectRepository {
  constructor(
    @InjectRepository(Subject)
    private readonly repo: Repository<Subject>,
  ) {}

  async saveSubject(subject: Subject): Promise<Subject> {
    return this.repo.save(subject);
  }

  async findSubjectById(id: number): Promise<Subject | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['branch'],
    });
  }

  async findSubjectByCode(code: string): Promise<Subject | null> {
    return this.repo.findOne({
      where: { code },
      relations: ['branch'],
    });
  }
  async findSubjectsByBranch(branchId: number): Promise<Subject[]> {
    return this.repo.find({
      where: { branch: { id: branchId } },
      relations: ['branch'],
    });
  }
  async findSubjectByBranchAndSemester(
    branchId: number,
    semesterId: number,
  ): Promise<Subject[]> {
    return this.repo.find({
      where: { semester: { id: semesterId }, branch: { id: branchId } },
      relations: ['branch'],
    });
  }
  async findAllSubjects(): Promise<Subject[]> {
    return this.repo.find({ relations: ['branch'] });
  }
}
