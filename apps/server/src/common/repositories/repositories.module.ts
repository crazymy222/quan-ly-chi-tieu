import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { WalletRepository } from './wallet.repository';
import { User, UserSchema } from '../entities/user.entity';
import { Wallet, WalletSchema } from '../entities/wallet.entity';
import { TransactionRepository } from './transaction.repository';
import { Transaction, TransactionSchema } from '../entities/transaction.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema }
    ]),
  ],
  providers: [UserRepository, WalletRepository, TransactionRepository],
  exports: [UserRepository, WalletRepository, TransactionRepository],
})
export class RepositoriesModule { }
