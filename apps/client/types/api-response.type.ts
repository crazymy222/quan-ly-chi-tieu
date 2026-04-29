import { IUserProfile } from './user.type';

export type * from '@qlct/types/api-response.type';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userProfile: IUserProfile;
}

export interface RegisterResponse extends LoginResponse {}

export interface GetManyResponse<T> {
  count: number;
  items: T[];
}

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export interface PaginationParams {
  page?: number;
  take?: number;
  order?: Order;
  sortField?: string;
}