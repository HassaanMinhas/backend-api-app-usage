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

    const users = result.rows.map((user) => {
      let status = 'offline';
      let differenceSeconds: number | null = null;

      if (user.last_seen) {
        const lastSeen = new Date(user.last_seen);

        differenceSeconds = Math.floor(
          (serverTime.getTime() - lastSeen.getTime()) / 1000,
        );

        status = differenceSeconds <= 35 ? 'online' : 'offline';
      }

      return {
        user_id: user.user_id,
        user_name: user.user_name,
        pc_name: user.pc_name,
        last_seen: user.last_seen,
        difference_seconds: differenceSeconds,
        status,
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


