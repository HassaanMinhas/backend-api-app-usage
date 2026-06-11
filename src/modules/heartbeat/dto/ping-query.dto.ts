import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PingQueryDto {
  @IsNotEmpty()
  @IsString()
  user_id!: string;
}
