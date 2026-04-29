import { Order } from "@/types/api-response.type";

export const IS_AUTH_API_END_POINT = [
  '/auth/login',
  '/auth/refresh',
  '/auth/register',
  '/auth/logout'
]

export const PAGINATION_LIMIT = 20;
export const DEFAULT_ORDER = Order.DESC;