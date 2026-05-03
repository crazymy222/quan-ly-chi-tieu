import { User } from '@/common/decorators/user.decorator';
import MongooseClassSerializerInterceptor from '@/common/interceptors/mongo-class-serializer.interceptor';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Res, UseInterceptors } from '@nestjs/common';
import type { Response } from 'express';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetDetailTransactionResponseDto } from './dto/get-detail-transaction-response.dto';
import { GetManyTransactionResponseDto } from './dto/get-many-transaction-response.dto';
import { GetStatisticsParamsDto } from './dto/get-statistics-parasm.dto';
import { GetTransactionHistoryParamsDto } from './dto/get-transaction-history-params.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTransactionDto: CreateTransactionDto, @User('id') uid: string) {
    return this.transactionService.create(createTransactionDto, uid);
  }

  @Get('total-transaction')
  @HttpCode(HttpStatus.OK)
  getTotalTransaction(@User('id') uid: string) {
    return this.transactionService.getTotalIncomeAndExpense(uid);
  }

  @Get()
  @UseInterceptors(MongooseClassSerializerInterceptor(GetManyTransactionResponseDto))
  @HttpCode(HttpStatus.OK)
  getTransactionHistory(
    @Query() getTransactionHistoryParamsDto: GetTransactionHistoryParamsDto,
    @User('id') uid: string
  ) {
    return this.transactionService.getTransactionHistory(getTransactionHistoryParamsDto, uid);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  getStatistics(
    @Query() getStatisticsParamsDto: GetStatisticsParamsDto,
    @User('id') uid: string
  ) {
    return this.transactionService.getStatistics(getStatisticsParamsDto, uid);
  }

  @Get('excel-export')
  @HttpCode(HttpStatus.OK)
  excelExport(
    @Query() getStatisticsParamsDto: GetStatisticsParamsDto,
    @User('id') uid: string,
    @Res() res: Response
  ) {
    return this.transactionService.excelExport(getStatisticsParamsDto, uid, res);
  }

  @Get(':id')
  @UseInterceptors(MongooseClassSerializerInterceptor(GetDetailTransactionResponseDto))
  @HttpCode(HttpStatus.OK)
  getDetailTransaction(@Param('id') id: string, @User('id') uid: string) {
    return this.transactionService.getDetailTransaction(id, uid);
  }
}
