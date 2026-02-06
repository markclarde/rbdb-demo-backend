import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profile.module';
import { BranchesModule } from './branches/branch.module';
import { QuotationsModule } from './quotations/quotation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    BranchesModule,
    QuotationsModule,
  ],
})
export class AppModule {}
