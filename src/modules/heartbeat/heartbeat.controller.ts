import { Controller, Get, Query } from '@nestjs/common';
import { HeartbeatService } from './heartbeat.service';
import { PingQueryDto } from './dto/ping-query.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('heartbeat')
export class HeartbeatController {
  constructor(private readonly heartbeatService: HeartbeatService) {}


  @Get('ping')
  async ping(
    @Query(new ValidationPipe({ transform: true })) query: PingQueryDto,
  ) {
    return this.heartbeatService.ping(query);
  }

   @Get('users-status')
  async getUsersStatus() {
    return this.heartbeatService.getUsersStatus();
  }

  
}
