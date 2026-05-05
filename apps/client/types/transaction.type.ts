import { TransactionType } from "@/constants/transaction.const";
import { PaginationParams } from "./api-response.type";
import { Wallet } from "./wallet.type";
import { IUserProfile } from "./user.type";

export interface GetTotalIncomeAndExpenseResponse {
  totalIncome: number;
  totalExpense: number;
}

export interface Transaction {
  id: string;
  transferId: string;
  transactionType: TransactionType;
  amount: number;
  createdAt: Date;
  note: string | null;
  transactionCategory: string;
  wallet: Wallet;
  userId: string;
  balanceBefore: number;
  balanceAfter: number;
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

export interface GetDetailTransactionResponse extends Transaction {
  peerUser: IUserProfile | null;
}
