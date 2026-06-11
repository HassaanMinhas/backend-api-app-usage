import { Controller, Post, Body, Get} from '@nestjs/common';
import { BusinessUserService } from './business-user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { InsertUserActivityDto } from './dto/insert-user-activity.dto';
import { CreateUserDto } from './dto/create-user.dto';


@Controller('business-user')
export class BusinessUserController {
  constructor(
    private readonly businessUserService: BusinessUserService,
  ) {}


@Post('insert-user')
insertUser(
  @Body() dto: CreateUserDto,
) {
  return this.businessUserService.insertUser(dto);
}


@Get('all-user-active-process')
getAllUserActivity() {
  return this.businessUserService.getUserActivity();
}

  @Post('insert-user-activity')
  insertUserActivity(
    @Body() dto: InsertUserActivityDto,
  ) {
    return this.businessUserService.insertUserActivity(dto);
  }


}
