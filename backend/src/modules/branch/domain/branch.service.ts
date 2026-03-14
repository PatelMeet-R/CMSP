import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BranchRepository } from '../data/repositories/repository';
import { BranchRegisterDto } from '../presentation/dto/request/branch-register.request.dto';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { BranchMapper } from '../data/mappers/branch.mapper';
import { BranchUpdateDto } from '../presentation/dto/request/branch-update.request.dto';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepository: BranchRepository) {}

  async registerBranch(dto: BranchRegisterDto) {
    const existingBranch = await this.branchRepository.findByName(dto.name);
    if (existingBranch) {
      throw new ConflictException(ERRORMESSAGE.BRANCH_ALREADY_EXISTS);
    }
    const newlyCreatedBranch =
      await this.branchRepository.createOrUpdateAndSave({
        name: dto.name,
        code: dto.code,
      });
    return BranchMapper.toBranchResponse(newlyCreatedBranch);
  }
  async getMeAllBranch() {
    return await this.branchRepository.findAll();
  }
  async updateBranch(id: number, dto: BranchUpdateDto) {
    const branch = await this.branchRepository.findById(id);

    if (!branch) {
      throw new NotFoundException(ERRORMESSAGE.BRANCH_INVALID_CREDENTIALS);
    }
    Object.assign(branch, dto);
    const updatedBranch =
      await this.branchRepository.createOrUpdateAndSave(branch);
    return BranchMapper.toBranchResponse(updatedBranch);
  }
  async getBranchEntityById(branchId: number): Promise<Branch> {
    const branch = await this.branchRepository.findById(branchId);

    if (!branch) {
      throw new NotFoundException(ERRORMESSAGE.BRANCH_INVALID_CREDENTIALS);
    }

    return branch;
  }
}
