import {
  Injectable,
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
    const { user_id } = query;

    if (!user_id) {
      throw new BadRequestException('user_id is required');
    }

    try {
      const result = await this.db.query(
        `
        UPDATE users
        SET last_seen = NOW()
        WHERE user_id = $1
        RETURNING user_id, last_seen;
        `,
        [user_id],
      );

      // USER NOT FOUND CASE
      if (result.rowCount === 0) {
        return {
          success: false,
          message: 'User not found',
          data: null,
        };
      }

      this.logger.log(`Heartbeat received for user: ${user_id}`);

      return {
        success: true,
        message: 'ping_response',
        server_time: new Date().toISOString(),
        data: result.rows[0],
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);

      this.logger.error(`Heartbeat error: ${message}`);
      throw error;
    }
  }
 

  async getUsersStatus() {
  try {
    const result = await this.db.query(
      `
      SELECT
        user_id,
        user_name,
        pc_name,
        last_seen
      FROM users
      ORDER BY user_name;
      `,
    );

    const serverTime = new Date();

const formatLastOnline = (diffSeconds: number): string => {
  const minutesTotal = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  const hoursTotal = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;

  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;

  // less than a minute
  if (minutesTotal < 1) {
    return `Last online: ${diffSeconds} seconds ago`;
  }

  // less than 1 hour
  if (hoursTotal < 1) {
    return `Last online: ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  // less than 24 hours
  if (days < 1) {
    if (minutes === 0) {
      return `Last online: ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    return `Last online: ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  // 1 day+
  if (hours === 0 && minutes === 0) {
    return `Last online: ${days} day${days !== 1 ? 's' : ''} ago`;
  }

  return `Last online: ${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
};

    const users = result.rows.map((user) => {
      let status = 'offline';
      let differenceSeconds: number | null = null;
      let last_online_text: string | null = null;

      if (user.last_seen) {
        const lastSeen = new Date(user.last_seen);

        differenceSeconds = Math.floor(
          (serverTime.getTime() - lastSeen.getTime()) / 1000,
        );

        // online threshold
        if (differenceSeconds <= 35) {
          status = 'online';
          last_online_text = 'Online now';
        } else {
          status = 'offline';
          last_online_text = formatLastOnline(differenceSeconds);
        }
      }

      return {
        user_id: user.user_id,
        user_name: user.user_name,
        pc_name: user.pc_name,
        last_seen: user.last_seen,
        difference_seconds: differenceSeconds,
        status,
        last_online_text,
      };
    });

    return {
      success: true,
      server_time: serverTime.toISOString(),
      data: users,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    this.logger.error(`Get users status error: ${message}`);
    throw error;
  }
}



}


