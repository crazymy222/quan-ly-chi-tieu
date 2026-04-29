import type { IUserProfile } from '@/common/types/user.type';
import { getInfoData } from '@/utils/common.utils';
import { BadRequestException, HttpException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AT_TTL, RT_TTL } from 'src/common/constants/auth.const';
import { ENV } from 'src/common/constants/env.const';
import { redisKey } from 'src/common/constants/redis.const';
import { IJwtPayload } from 'src/common/types/auth.type';
import { CachedService } from 'src/libs/cached/cached.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRepository } from '@/common/repositories/user.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cachedService: CachedService,
    private readonly userRepository: UserRepository,
  ) { }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    try {
      const foundUser = await this.verifyUser(email, password);
      const tokenPair = await this.generateTokenPair({ uid: foundUser.id, email: foundUser.email });
      return { ...tokenPair, userProfile: foundUser };
    } catch (error) {
      this.logger.error(`login: Login failed`);
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Login failed');
    }
  }

  async register(registerDto: RegisterDto): Promise<{ accessToken: string, refreshToken: string, userProfile: IUserProfile }> {
    const { email, password, displayName } = registerDto;
    try {
      const isExist = await this.userService.checkExist(email);
      if (isExist) {
        this.logger.error(`register: User already exists`);
        throw new BadRequestException('User already exists');
      }
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await this.userRepository.create({ email, password: hashedPassword, displayName });
      const tokenPair = await this.generateTokenPair({ uid: newUser.id, email: newUser.email });
      return { ...tokenPair, userProfile: newUser };
    } catch (error) {
      this.logger.error(`register: Register failed`);
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Register failed');
    }
  }

  async logout(tokenPayload: IJwtPayload): Promise<void> {
    await this.revokeToken(tokenPayload);
  }

  async refreshTokenPair(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    try {
      const payload = await this.verifyToken(
        refreshToken,
        this.configService.getOrThrow(ENV.JWT_REFRESH_TOKEN_SECRET)
      );

      const isInBlacklist = await this.checkTokenBlacklist(payload);
      if (isInBlacklist) {
        this.logger.error(`refreshTokenPair: Refresh token is in blacklist`);
        throw new UnauthorizedException('Invalid token')
      }

      await this.revokeToken(payload);

      const newTokenPair = await this.generateTokenPair({ uid: payload.uid, email: payload.email });
      return newTokenPair;
    } catch (error) {
      this.logger.error(`refreshTokenPair: Refresh token failed`);
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Refresh token failed');
    }
  }

  private async verifyUser(email: string, password: string) {
    const foundUser = await this.userRepository.findOneByCondition({ email });
    if (!foundUser) {
      this.logger.error(`verifyUser: User not found`);
      throw new NotFoundException('User not found');
    }
    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    if (!isValidPassword) {
      this.logger.error(`verifyUser: Invalid password`);
      throw new UnauthorizedException('Login failed');
    }
    return foundUser;
  }

  async generateTokenPair(props: { uid: string, email: string }): Promise<{ accessToken: string, refreshToken: string }> {
    const tokenPayload: IJwtPayload = {
      uid: props.uid,
      email: props.email,
      jti: randomUUID(),
      iat: Math.floor(Date.now() / 1000),
    }

    const atPromise = this.jwtService.signAsync(
      tokenPayload,
      {
        secret: this.configService.getOrThrow(ENV.JWT_ACCESS_TOKEN_SECRET),
        expiresIn: AT_TTL,
      }
    );

    const rtPromise = this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow(ENV.JWT_REFRESH_TOKEN_SECRET),
      expiresIn: RT_TTL,
    });

    const [at, rt] = await Promise.all([atPromise, rtPromise]);

    return { accessToken: at, refreshToken: rt };
  }

  async verifyToken(token: string, secret: string): Promise<IJwtPayload> {
    try {
      return this.jwtService.verifyAsync(token, { secret });
    } catch (error) {
      this.logger.error(`verifyToken: Invalid token`);
      this.logger.error(error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async checkTokenBlacklist(payload: IJwtPayload): Promise<boolean> {
    const { jti, uid } = payload;
    const key = redisKey.getTokenBlackListKey(uid, jti);
    const cachedData = await this.cachedService.get(key);
    return !!cachedData;
  }

  async revokeToken(payload: IJwtPayload): Promise<void> {
    const { jti, uid, iat } = payload;
    const key = redisKey.getTokenBlackListKey(uid, jti);
    const ex = (iat + RT_TTL / 1000) - Math.floor(Date.now() / 1000);
    await this.cachedService.set(key, 1, ex);
  }
}