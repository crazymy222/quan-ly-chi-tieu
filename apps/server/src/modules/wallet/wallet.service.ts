import { Order } from '@/common/constants/pagination.const';
import { REDIS_TTL, REDIS_VALUE, redisKey } from '@/common/constants/redis.const';
import { UserRepository } from '@/common/repositories/user.repository';
import { WalletRepository } from '@/common/repositories/wallet.repository';
import { CachedService } from '@/libs/cached/cached.service';
import { jsonParse } from '@/utils/common.utils';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Connection, Types } from 'mongoose';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { GetAllWalletParamsDto } from './dto/get-all-wallet-params.dto';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly cachedService: CachedService,
    private readonly userRepository: UserRepository,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async create(createWalletDto: CreateWalletDto, userId: string) {
    const existWallet = await this.checkWalletExistWithName(createWalletDto.name, userId);
    if (existWallet) {
      throw new BadRequestException('Wallet name already exists');
    }
    await Promise.allSettled([
      this.cachedService.incr(redisKey.getWalletListVersionKey(userId)),
      this.cachedService.del(redisKey.getWalletCountKey(userId)),
      this.cachedService.del(redisKey.getTotalBalanceKey(userId)),
    ]);

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const createdWallet = await this.walletRepository.create({ ...createWalletDto, userId }, { session });
        const updatedUser = await this.userRepository.findOneAndUpdate({ _id: userId, defaultWallet: null }, { defaultWallet: createdWallet.id }, { session });
        if (updatedUser) {
          await this.cachedService.del(redisKey.getDefaultWalletKey(userId));
        } else {
          throw new NotFoundException('User not found');
        }
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create wallet');
    } finally {
      await session.endSession();
    }
  }

  async findAll(getAllWalletParamsDto: GetAllWalletParamsDto, userId: string) {
    const { page, take, order, sortField, priorityId } = getAllWalletParamsDto;
    const versionKey = redisKey.getWalletListVersionKey(userId);
    const version = (await this.cachedService.get(versionKey)) || '0';
    const key = redisKey.getWalletsPaginatedKey(userId, version, getAllWalletParamsDto);
    const cachedData = await this.cachedService.get(key);
    if (cachedData) {
      try {
        return jsonParse(cachedData);
      } catch (error) {
        await this.cachedService.del(key);
      }
    }
    const data = await this.walletRepository.findAll({
       user: new Types.ObjectId(userId), 
       deletedAt: null, 
       priorityId: priorityId ? new Types.ObjectId(priorityId) : undefined
       }, {
      skip: (page - 1) * take,
      limit: take,
      sort: { [sortField]: order === Order.ASC ? 1 : -1 },
    });
    await this.cachedService.set(key, JSON.stringify(data), REDIS_TTL.DEFAULT);
    return data;
  }

  async findOne(id: string, userId: string) {
    const key = redisKey.getWalletByIdKey(userId, id);
    const cachedData = await this.cachedService.get(key);
    if (cachedData) {
      try {
        const data = jsonParse(cachedData);
        if (!data) {
          throw new NotFoundException('Wallet not found');
        }
        return data;
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        await this.cachedService.del(key);
      }
    }
    const walletDetail = await this.walletRepository.findOneByCondition({ id: id, user: userId, deletedAt: null });
    await this.cachedService.set(key, JSON.stringify(walletDetail), REDIS_TTL.DEFAULT);
    if (!walletDetail) {
      throw new NotFoundException('Wallet not found');
    }
    return walletDetail;
  }

  async checkWalletExistWithName(name: string, userId: string) {
    const key = redisKey.getWalletExistKey(userId, name);
    const cachedData = await this.cachedService.get(key);
    if (cachedData) {
      return cachedData === REDIS_VALUE.EXIST;
    }
    const isExist = await this.walletRepository.isExist({ name: name, user: userId, deletedAt: null });
    await this.cachedService.set(key, isExist ? REDIS_VALUE.EXIST : REDIS_VALUE.NOT_EXIST, REDIS_TTL.DEFAULT);
    return !!isExist;
  }

  async getTotalBalance(userId: string) {
    const key = redisKey.getTotalBalanceKey(userId);
    const cachedData = await this.cachedService.get(key);
    if (cachedData) {
      return jsonParse(cachedData);
    }
    const totalBalance = await this.walletRepository.getTotalBalance(userId);
    await this.cachedService.set(key, totalBalance.toString(), REDIS_TTL.DEFAULT);
    return totalBalance;
  }

  async getWalletCount(userId: string) {
    const key = redisKey.getWalletCountKey(userId);
    const cachedData = await this.cachedService.get(key);
    if (cachedData) {
      return Number(cachedData);
    }
    const count = await this.walletRepository.getWalletCount(userId);
    await this.cachedService.set(key, count.toString(), REDIS_TTL.DEFAULT);
    return count;
  }

  async setDefaultWallet(walletId: string, userId: string) {
    const wallet = await this.walletRepository.findOneByCondition({ _id: walletId, user: userId, deletedAt: null });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    const updatedUser = await this.userRepository.setDefaultWallet(userId, walletId);
    if (updatedUser) {
      await this.cachedService.del(redisKey.getDefaultWalletKey(userId));
    } else {
      throw new NotFoundException('Wallet not found');
    }
  }

  async getDefaultWallet(userId: string) {
    const key = redisKey.getDefaultWalletKey(userId);
    const cachedData = await this.cachedService.get(key);
    if (cachedData) {
      try {
        const data = jsonParse(cachedData);
        if (!data) {
          throw new NotFoundException('Default wallet not found');
        }
        return data;
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        await this.cachedService.del(key);
      }
    }
    const defaultWallet = await this.userRepository.getDefaultWallet(userId);
    await this.cachedService.set(key, JSON.stringify(defaultWallet), REDIS_TTL.DEFAULT);
    if (!defaultWallet) {
      throw new NotFoundException('Default wallet not found');
    }
    return defaultWallet;
  }
}

