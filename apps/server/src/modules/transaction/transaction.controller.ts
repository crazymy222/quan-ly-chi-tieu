import { User } from '@/common/decorators/user.decorator';
import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionService } from './transaction.service';
import { GetTransactionHistoryParamsDto } from './dto/get-transaction-history-params.dto';
import MongooseClassSerializerInterceptor from '@/common/interceptors/mongo-class-serializer.interceptor';
import { GetManyTransactionResponseDto } from './dto/get-many-transaction-response.dto';
import { GetStatisticsParamsDto } from './dto/get-statistics-parasm.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @User('id') uid: string) {
    return this.transactionService.create(createTransactionDto, uid);
  }

  @Get('total-transaction')
  getTotalTransaction(@User('id') uid: string) {
    return this.transactionService.getTotalIncomeAndExpense(uid);
  }

  @Get()
  @UseInterceptors(MongooseClassSerializerInterceptor(GetManyTransactionResponseDto))
  getTransactionHistory(
    @Query() getTransactionHistoryParamsDto: GetTransactionHistoryParamsDto,
    @User('id') uid: string
  ) {
    return this.transactionService.getTransactionHistory(getTransactionHistoryParamsDto, uid);
  }

  @Get('statistics')
  getStatistics(
    @Query() getStatisticsParamsDto: GetStatisticsParamsDto,
    @User('id') uid: string
  ) {
    return this.transactionService.getStatistics(getStatisticsParamsDto, uid);
  }
}
