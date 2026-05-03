import { User } from '@/common/decorators/user.decorator';
import { PaginationOptionsDto } from '@/common/dtos/pagination-options.dto';
import MongooseClassSerializerInterceptor from '@/common/interceptors/mongo-class-serializer.interceptor';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { GetManyWalletResponseDto } from './dto/get-many-wallet-response.dto';
import { GetOneWalletResponseDto } from './dto/get-one-wallet-response.dto';
import { WalletService } from './wallet.service';
import { SetDefaultWalletDto } from './dto/set-default-wallet.dto';
import { GetAllWalletParamsDto } from './dto/get-all-wallet-params.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWalletDto: CreateWalletDto, @User('id') uid: string) {
    return this.walletService.create(createWalletDto, uid);
  }

  @Get()
  @UseInterceptors(MongooseClassSerializerInterceptor(GetManyWalletResponseDto))
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() getAllWalletParamsDto: GetAllWalletParamsDto,
    @User('id') uid: string,
  ) {
    return this.walletService.findAll(getAllWalletParamsDto, uid);
  }

  @Get('default')
  @UseInterceptors(MongooseClassSerializerInterceptor(GetOneWalletResponseDto))
  @HttpCode(HttpStatus.OK)
  getDefaultWallet(@User('id') uid: string) {
    return this.walletService.getDefaultWallet(uid);
  }

  @Get('total-balance')
  @HttpCode(HttpStatus.OK)
  getTotalBalance(@User('id') uid: string) {
    return this.walletService.getTotalBalance(uid);
  }

  @Get('count')
  @HttpCode(HttpStatus.OK)
  getWalletCount(@User('id') uid: string) {
    return this.walletService.getWalletCount(uid);
  }

  @Get(':id')
  @UseInterceptors(MongooseClassSerializerInterceptor(GetOneWalletResponseDto))
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string, @User('id') uid: string) {
    return this.walletService.findOne(id, uid);
  }

  @Patch('default')
  @HttpCode(HttpStatus.OK)
  setDefaultWallet(@Body() { walletId }: SetDefaultWalletDto, @User('id') uid: string) {
    return this.walletService.setDefaultWallet(walletId, uid);
  }
}
