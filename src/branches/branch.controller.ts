import { Controller, Get } from '@nestjs/common';
import { BranchesService } from './branch.service';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branches_service: BranchesService) {}

  @Get()
  async getBranches() {
    return this.branches_service.getBranches();
  }
}
