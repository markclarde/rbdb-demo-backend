import { Module } from '@nestjs/common';
import { BranchesService } from './branch.service';
import { BranchesController } from './branch.controller';

@Module({
  controllers: [BranchesController],
  providers: [BranchesService],
})
export class BranchesModule {}
