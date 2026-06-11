import { Module } from '@nestjs/common';
import { HeartbeatController } from './heartbeat.controller';
import { HeartbeatService } from './heartbeat.service';
import { DatabaseModule } from '../../database/database.module'; 

@Module({
  imports: [DatabaseModule],  
  controllers: [HeartbeatController],
  providers: [HeartbeatService],
})
export class HeartbeatModule {}
