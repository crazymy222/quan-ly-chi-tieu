import { IOAuthProfile } from '@/common/types/auth.type';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { UserService } from '../user/user.service';
import { UserRepository } from '@/common/repositories/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OauthService {
  private logger = new Logger(OauthService.name);

  constructor(
    private userService: UserService,
    private userRepository: UserRepository,
  ) { }

  async validateGoogleUser(googleUser: IOAuthProfile) {
    if (!googleUser) throw new UnauthorizedException()

    try {
      const { email, displayName } = googleUser;

      let foundUser = await this.userRepository.findOneByCondition({ email });

      if (!foundUser) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(randomUUID(), salt);
        foundUser = await this.userService.createUser(
          {
            email,
            password: hashedPassword,
            displayName,
          },
        );
      }

      return foundUser;
    } catch (error) {
      this.logger.error('Failed to validate google user');
      this.logger.error(error);
      throw new UnauthorizedException();
    }
  }
}
