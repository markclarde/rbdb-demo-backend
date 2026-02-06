import { Controller, Get } from '@nestjs/common';
import { BranchesService } from './branches.service';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branches_service: BranchesService) {}

  @Get()
  async getBranches() {
    return this.branches_service.getBranches();
  }
}
