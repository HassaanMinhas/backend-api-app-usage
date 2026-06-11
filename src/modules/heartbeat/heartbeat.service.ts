import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PingQueryDto } from './dto/ping-query.dto';


@Injectable()
export class HeartbeatService {
  private readonly logger = new Logger(HeartbeatService.name);
  constructor(private db: DatabaseService) {}

  async ping(query: PingQueryDto) {
    const {
      user_id,
    } = query;


    // Validate all required fields
    if (!user_id) throw new BadRequestException('client_id is required');
   
    return {
      success: true,
      message: 'ping_response',
    };
    
  }
}