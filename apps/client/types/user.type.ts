import { PaginationParams } from './api-response.type';

export type * from '@qlct/types/user.type';

export interface GetReciverParams extends PaginationParams {
  search?: string;
}