import { User } from '@/common/decorators/user.decorator';
import { User as UserEntity } from '@/common/entities/user.entity';
import MongooseClassSerializerInterceptor from '@/common/interceptors/mongo-class-serializer.interceptor';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';

@UseInterceptors(MongooseClassSerializerInterceptor(UserEntity))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  async getProfile(@User() user: UserEntity) {
    return user;
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
