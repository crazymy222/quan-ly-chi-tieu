import { Order } from '@/common/constants/pagination.const';
import { REDIS_TTL, redisKey } from '@/common/constants/redis.const';
import { User } from '@/common/entities/user.entity';
import { UserRepository } from '@/common/repositories/user.repository';
import { CachedService } from '@/libs/cached/cached.service';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { jsonParse } from '@/utils/common.utils';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GetReciverParamsDto } from './dto/get-reciver-params.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cachedService: CachedService
  ) { }

  async getUserById(id: string) {
    const key = redisKey.getUserProfileByIdKey(id);
    const cachedData = await this.cachedService.get(key);

    if (cachedData) {
      const data = jsonParse<User>(cachedData);
      if (!data) {
        throw new NotFoundException('User not found');
      }
      return data;
    }

    const user = await this.userRepository.findOneById(id);

    await this.cachedService.set(key, JSON.stringify(user), REDIS_TTL.USER_PROFILE);

    if (!user) {
      this.logger.error(`getUserById: User not found`);
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(user: RegisterDto) {
    return this.userRepository.create(user);
  }

  async checkExist(email: string): Promise<boolean> {
    const key = redisKey.getUserExistKey(email);
    const cachedData = await this.cachedService.get(key);
    if (cachedData) return true;

    const result = await this.userRepository.isExist({ email });
    if (result) await this.cachedService.set(key, '1', REDIS_TTL.USER_EXIST);
    return !!result;
  }

  async getReceivers(params: GetReciverParamsDto, uid: string) {
    const { page, take, sortField, order, search } = params;
    return this.userRepository.getReceivers(uid, { search }, { sortField, order, page, take });
  }  
}
