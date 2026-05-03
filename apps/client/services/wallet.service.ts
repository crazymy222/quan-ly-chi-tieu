import { CreateWalletFormData } from "@/components/create-wallet-dialog";
import api from "@/lib/axios";
import { GetManyResponse } from "@/types/api-response.type";
import { GetWalletsParams, Wallet } from "@/types/wallet.type";
import { DefaultResponse } from "@qlct/types/api-response.type";

export const getTotalBalance = async () => api.get<DefaultResponse<number>>('/wallet/total-balance');

export const getWalletCount = async () => api.get<DefaultResponse<number>>('/wallet/count');

export const getPaginationWallet = async (params: GetWalletsParams) => api.get<DefaultResponse<GetManyResponse<Wallet>>>('/wallet', { params });

export const createWallet = async (data: CreateWalletFormData) => api.post<DefaultResponse<null>>('/wallet', data);

export const updateDefaultWallet = async (walletId: string) => api.patch<DefaultResponse<null>>('/wallet/default', { walletId });

export const getDefaultWallet = async () => api.get<DefaultResponse<Wallet>>('/wallet/default');