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
      const hoursTotal = Math.floor(minutesTotal / 60);
      const minutes = minutesTotal % 60;
      const days = Math.floor(hoursTotal / 24);
      const hours = hoursTotal % 24;

      if (minutesTotal < 1) {
        return `Last online: ${diffSeconds} seconds ago`;
      }

      if (hoursTotal < 1) {
        return `Last online: ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }

      if (days < 1) {
        if (minutes === 0) {
          return `Last online: ${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }

        return `Last online: ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }

      if (hours === 0 && minutes === 0) {
        return `Last online: ${days} day${days !== 1 ? 's' : ''} ago`;
      }

      return `Last online: ${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    };

    // User IDs to exclude from API response
    const deletedUserIds = new Set([
      '0bfc21fc1fab45fe9694c8a2ad6c99e3',
      '2cb1e6e875824f12a67531ca17ec4ebe',
      '5e5b63a25acb47d0a88394d4b6aa12ff',
      '6bc8653048e84a3181d55719164b4011',
      '84835018647c4e7ea19e178862dd549f',
      'bbea8b33d78b41b8a69919fade60ddb6',

      '859fb87570754754a0c30e6830e7d35d',

      'b492fe3ea2b54678bdc20e8b16a37ec8',

      'd481d00faf464d528209834758531e14',

      '2f56e905e6d24f9e828cd9599fb12217',

      '06405b0409574bc78c23c88b597a9f20',

      '8209d15c90764827949f6ebfce79c09f',
      'af5f2dec33814d598341fedaf390bfb9',

      '75e9343ad1564fc499ad13cc37c75146',
      '7dea00ec65e84976b04396be741a333f',

      'ef6c99e52223471c974b540a8edf9e8e',
    ]);

    const users = result.rows
      .filter((user) => !deletedUserIds.has(user.user_id))
      .map((user) => {
        let status = 'offline';
        let differenceSeconds: number | null = null;
        let last_online_text: string | null = null;

        if (user.last_seen) {
          const lastSeen = new Date(user.last_seen);

          differenceSeconds = Math.floor(
            (serverTime.getTime() - lastSeen.getTime()) / 1000,
          );

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


