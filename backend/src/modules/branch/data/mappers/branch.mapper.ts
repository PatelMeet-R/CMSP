import { Branch } from '../../domain/entities/branch.entity';
import { BranchResponseDto } from '../../presentation/dto/response/branch.response.dto';

export class BranchMapper {
  static toBranchResponse(branch: Branch): BranchResponseDto {
    return {
      id: branch.id,
      code: branch.code,
      name: branch.name,
    };
  }
  static getMeAllBranchResponse(branches: Branch[]): BranchResponseDto[] {
    return branches.map((b) => this.toBranchResponse(b));
  }
  
}
