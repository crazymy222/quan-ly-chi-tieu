import { CreateTransactionFormData } from "@/components/create-transaction-dialog";
import api from "@/lib/axios";
import { GetManyResponse } from "@/types/api-response.type";
import { GetTransactionHistoryParams, GetTotalIncomeAndExpenseResponse, Transaction, GetStatisticsParams, GetStatisticsResponse, GetDetailTransactionResponse } from "@/types/transaction.type";
import { DefaultResponse } from "@qlct/types/api-response.type";

export const getTotalIncomeAndExpense = async () => api.get<DefaultResponse<GetTotalIncomeAndExpenseResponse>>('/transaction/total-transaction');

export const createTransaction = async (data: CreateTransactionFormData) => api.post<DefaultResponse<null>>('/transaction', data);

export const getTransactionHistory = async (params: GetTransactionHistoryParams) => api.get<DefaultResponse<GetManyResponse<Transaction>>>('/transaction', { params });

export const getStatistics = async (params: GetStatisticsParams) => api.get<DefaultResponse<GetStatisticsResponse>>('/transaction/statistics', { params });

export const getDetailTransaction = async (id: string) => api.get<DefaultResponse<GetDetailTransactionResponse>>('/transaction/' + id);

export const downloadReport = async (params: GetStatisticsParams) => api.get<Blob>('/transaction/excel-export', { params, responseType: 'blob' });