import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class InsertUserActivityDto {

  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsDateString()
  activity_start_date!: string;

  @IsDateString()
  activity_end_date!: string;

  @IsString()
  @IsNotEmpty()
  application_name!: string;

  @IsDateString()
  start_time!: string;

  @IsDateString()
  end_time!: string;

  @IsInt()
  duration_minutes!: number;  

  @IsInt()
  pid!: number;
}