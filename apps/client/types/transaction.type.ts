import { TransactionType } from "@/constants/transaction.const";
import { PaginationParams } from "./api-response.type";

export interface GetTotalIncomeAndExpenseResponse {
  totalIncome: number;
  totalExpense: number;
}

export interface Transaction {
  id: string;
  transactionType: TransactionType;
  amount: number;
  transactionDate: Date;
  note: string | null;
  transactionCategory: string;
  wallet: Wallet;
  userId: string;
  runningBalance: number;
}

export interface GetTransactionHistoryParams extends PaginationParams {
  walletId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface GetStatisticsParams {
  walletId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface GetStatisticsResponse {
  totalIncome: number;
  totalExpense: number;
}
