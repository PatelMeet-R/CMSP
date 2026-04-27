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
import type { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepository: BranchRepository) {}

  // ==================================

  async registerBranch(dto: BranchRegisterDto, currentUser: UserResponseDto) {
    const existingBranch = await this.branchRepository.findByName(dto.name);
    if (existingBranch) {
      throw new ConflictException(ERRORMESSAGE.BRANCH_ALREADY_EXISTS);
    }
    const newlyCreatedBranch =
      await this.branchRepository.createOrUpdateAndSave({
        name: dto.name,
        code: dto.code,
        createdBy: currentUser.id,
      });
    return BranchMapper.toBranchResponse(newlyCreatedBranch);
  }

  // ==================================

  async getMeAllBranch() {
    return await this.branchRepository.findAll();
  }

  // ==================================

  async updateBranch(
    id: string,
    dto: BranchUpdateDto,
    currentUser: UserResponseDto,
  ) {
    const branch = await this.branchRepository.findById(id);

    if (!branch) {
      throw new NotFoundException(ERRORMESSAGE.BRANCH_INVALID_CREDENTIALS);
    }

    Object.assign(branch, dto);
    branch.updatedBy = currentUser.id;

    const updatedBranch =
      await this.branchRepository.createOrUpdateAndSave(branch);
    return BranchMapper.toBranchResponse(updatedBranch);
  }
  
  async getBranchEntityById(branchId: string): Promise<Branch> {
    const branch = await this.branchRepository.findById(branchId);

    if (!branch) {
      throw new NotFoundException(ERRORMESSAGE.BRANCH_INVALID_CREDENTIALS);
    }

    return branch;
  }
}
