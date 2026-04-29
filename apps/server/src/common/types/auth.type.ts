export interface IJwtPayload {
  uid: string;
  email: string;
  jti: string;
  iat: number;
}

export enum OAuthProviderEnum {
  GOOGLE = 'google',
}

export interface IOAuthProfile {
  displayName: string,
  email: string,
  provider: OAuthProviderEnum,
  providerId: string
}
