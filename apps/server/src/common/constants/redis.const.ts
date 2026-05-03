import { GetAllWalletParamsDto } from "@/modules/wallet/dto/get-all-wallet-params.dto"
import querystring from "querystring"

export const redisKey = {
  // session
  getTokenBlackListKey: (uid: string, jti: string) => `user:uid:${uid}:session-black-list:${jti}`,

  // rate limit
  getRateLimitKey: (identifier: string | number, url: string) => `throttle:${identifier}:${url}`,

  // user
  getUserProfileByIdKey: (uid: string) => `user:uid:${uid}:profile`,
  getUserExistKey: (email: string) => `user:email:${email}:exist`,

  // wallet
  getWalletsKey: (uid: string) => `user:uid:${uid}:wallets`,
  getWalletListVersionKey: (uid: string) => `user:uid:${uid}:wallets:version`,
  getWalletsPaginatedKey: (uid: string, version: string | number, params: GetAllWalletParamsDto) => {
    const queryString = querystring.stringify({
      page: params.page,
      take: params.take,
      order: params.order,
      sortField: params.sortField,
      priorityId: params.priorityId,
    });
    return `user:uid:${uid}:wallets:v:${version}:params?${queryString}`
  },
  getWalletByIdKey: (uid: string, id: string) => `user:uid:${uid}:wallet:${id}`,
  getWalletExistKey: (uid?: string, id?: string, name?: string) => `wallet:${uid ? `uid:${uid}:` : ''}${id ? `id:${id}:` : ''}${name ? `name:${name}:` : ''}exist`,
  getTotalBalanceKey: (uid: string) => `user:uid:${uid}:total-balance`,
  getWalletCountKey: (uid: string) => `user:uid:${uid}:wallet-count`,
  getDefaultWalletKey: (uid: string) => `user:uid:${uid}:default-wallet`,
}

export const REDIS_TTL = {
  DEFAULT: 60, // 1 minute

  USER_PROFILE: 60,
  USER_EXIST: 60,
}

export const REDIS_VALUE = {
  EXIST: '1',
  NOT_EXIST: '0',
  EMPTY: 'EMPTY',
}