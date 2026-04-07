import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from '../domain/entity/assignment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssignmentRepository {
  constructor(
    @InjectRepository(Assignment)
    private readonly repo: Repository<Assignment>,
  ) {}
  async saveAssignment(data: Assignment): Promise<Assignment> {
    return this.repo.save(data);
  }
  async findAssignmentByIdWithAttachmentRelation(
    assignmentId: number,
  ): Promise<Assignment | null> {
    return this.repo.findOne({
      where: { id: assignmentId },
      relations: ['attachment'],
    });
  }
  async removeAssignment(assignment: Assignment): Promise<void> {
    await this.repo.remove(assignment);
  }
  async findAllByFilter(
    branchId: number,
    semesterId: number,
  ): Promise<Assignment[]> {
    return await this.repo.find({
      where: {
        branch: { id: branchId },
        semester: { id: semesterId },
      },
      relations: ['subject', 'branch', 'semester', 'attachment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAssignmentByIdWithAllRelation(
    id: number,
  ): Promise<Assignment | null> {
    return await this.repo.findOne({
      where: { id },
      relations: [
        'subject',
        'branch',
        'semester',
        'attachment',
        'academicYear',
      ],
    });
  }
  async findAllAssignement(): Promise<Assignment[]> {
    return await this.repo.find({
      relations: [
        'subject',
        'branch',
        'semester',
        'attachment',
        'academicYear',
      ],
    });
  }
  async findAllAssignmentByBranchId(branchId: number): Promise<Assignment[]> {
    return await this.repo.find({
      where: { branch: { id: branchId } },
      relations: [
        'subject',
        'branch',
        'semester',
        'attachment',
        'academicYear',
      ],
    });
  }
}
