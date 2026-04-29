import { CreateWalletFormData } from "@/components/create-wallet-dialog";
import api from "@/lib/axios";
import { GetManyResponse } from "@/types/api-response.type";
import { DefaultResponse } from "@qlct/types/api-response.type";

export const getTotalBalance = async () => api.get<DefaultResponse<number>>('/wallet/total-balance');

export const getWalletCount = async () => api.get<DefaultResponse<number>>('/wallet/count');

export const getPaginationWallet = async (params: { page: number, take: number }) => api.get<DefaultResponse<GetManyResponse<Wallet>>>('/wallet', { params });

export const createWallet = async (data: CreateWalletFormData) => api.post<DefaultResponse<Wallet>>('/wallet', data);