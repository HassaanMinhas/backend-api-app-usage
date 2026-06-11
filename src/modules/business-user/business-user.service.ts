import { UnauthorizedException, BadRequestException, Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { ForbiddenException } from '@nestjs/common';
import { InsertUserActivityDto } from './dto/insert-user-activity.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class BusinessUserService {

  constructor(
    private readonly db: DatabaseService,
  ) { }


//--------------------------- Steering Wheel -------------------------------- Begin

async insertUser(dto: CreateUserDto) {
  // 1. Check if user already exists
  const checkQuery = `
    SELECT * FROM users
    WHERE user_id = $1;
  `;

const existingResult = await this.db.query(checkQuery, [dto.user_id]);

if (existingResult.rows.length > 0) {
  return {
    message: 'User already exists',
    data: existingResult.rows[0],
  };
}

  // 3. Otherwise insert new user
  const query = `
    INSERT INTO users (user_id, user_name, pc_name)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const result = await this.db.query(query, [
    dto.user_id,
    dto.user_name,
    dto.pc_name,
  ]);


  return {
    message: 'User inserted successfully',
    data: result[0],
  };
}



async getUserActivity() {
  try {
    const query = `
      SELECT
        ua.activity_id,
        ua.user_id,
        u.user_name,
        ua.activity_start_date,
        ua.activity_end_date,
        ua.application_name,
        ua.start_time,
        ua.end_time,
        ua.duration_minutes,
        ua.pid
      FROM user_activity ua
      JOIN users u ON u.user_id = ua.user_id
      ORDER BY ua.start_time DESC
    `;

    const { rows } = await this.db.query(query);

    return {
      success: true,
      total_records: rows.length,
      activities: rows,
    };
  } catch (e) {
    console.error('getUserActivity error:', e);
    throw new InternalServerErrorException('Failed to fetch user activity');
  }
}


async insertUserActivity(dto: InsertUserActivityDto) {
  try {
    const query = `
      INSERT INTO user_activity (
        user_id,
        activity_start_date,
        activity_end_date,
        application_name,
        start_time,
        end_time,
        duration_minutes,
        pid
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      dto.user_id,
      dto.activity_start_date,
      dto.activity_end_date,
      dto.application_name,
      dto.start_time,
      dto.end_time,
      dto.duration_minutes,
      dto.pid,
    ];

    const result = await this.db.query(query, values);

    return {
      success: true,
      message: 'Activity inserted successfully',
      data: result.rows[0],
    };
  } catch (error) {
    console.error('insertUserActivity error:', error);
    throw new Error('Failed to insert user activity');
  }
}


//--------------------------- Steering Wheel -------------------------------- End




}
