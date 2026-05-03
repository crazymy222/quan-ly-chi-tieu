import { User } from '@/common/decorators/user.decorator';
import { User as UserEntity } from '@/common/entities/user.entity';
import MongooseClassSerializerInterceptor from '@/common/interceptors/mongo-class-serializer.interceptor';
import { Controller, Get, HttpStatus, HttpCode, Param, Query, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { GetReciverParamsDto } from './dto/get-reciver-params.dto';
import { GetReciverResponseDto } from './dto/get-reciver-response.dto';

@UseInterceptors(MongooseClassSerializerInterceptor(UserEntity))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@User() user: UserEntity) {
    return user;
  }

  @Get('receiver')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MongooseClassSerializerInterceptor(GetReciverResponseDto))
  async getUsers(
    @User('id') uid: string,
    @Query() params: GetReciverParamsDto
  ) {
    return this.userService.getReceivers(params, uid);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
