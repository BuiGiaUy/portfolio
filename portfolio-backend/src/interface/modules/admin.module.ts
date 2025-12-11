import { Module } from '@nestjs/common';
import { AdminController } from '../controllers/admin.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
