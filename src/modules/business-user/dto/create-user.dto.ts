import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  user_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  pc_name!: string;
}