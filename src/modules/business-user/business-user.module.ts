import { Module } from '@nestjs/common';
import { BusinessUserController } from './business-user.controller';
import { BusinessUserService } from './business-user.service';
import { DatabaseModule } from '../../database/database.module';


@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [BusinessUserController],
  providers: [BusinessUserService],
})
export class BusinessUserModule {}
