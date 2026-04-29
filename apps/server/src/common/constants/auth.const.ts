import { CookieOptions } from "express";
import ms from "ms";

export const AT_TTL = ms('15m');
export const RT_TTL = ms('7d');

export const AUTH_COOKIE_OPTS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: ms('30d'),
};

export const AT_COOKIE_NAME = "at";
export const RT_COOKIE_NAME = "rt";