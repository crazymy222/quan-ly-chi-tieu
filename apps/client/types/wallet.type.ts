import { PaginationParams } from "./api-response.type";

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  accountNumber: string | null;
  createdAt: Date;
  userId: string;
}

export interface GetWalletsParams extends PaginationParams {
  priorityId?: string;
}