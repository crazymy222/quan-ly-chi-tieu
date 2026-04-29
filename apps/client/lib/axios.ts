import { IS_AUTH_API_END_POINT } from "@/constants/api.const";
import { PROTECTED_ROUTES_EXACT, PROTECTED_ROUTES_PREFIX } from "@/constants/auth.const";
import { NEXT_PUBLIC_API_URL } from "@/constants/env.const";
import { refreshToken } from "@/services/auth.service";
import axios, { HttpStatusCode } from "axios";

const isServer = typeof window === 'undefined';

const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const originRequest = err.config;
    const urlEndPoint = originRequest.url;
    const isRetry = originRequest._retry;
    const isAuthEndpoint = IS_AUTH_API_END_POINT.includes(urlEndPoint);

    if (status === HttpStatusCode.Unauthorized) {

      if (isRetry || isAuthEndpoint) return Promise.reject(err);

      try {
        if (!refreshPromise) {
          refreshPromise = refreshToken().then(() => api(originRequest));
        }
        await refreshPromise;
      } catch (refreshError) {
        if (!isServer) {
          const currentPath = window.location.pathname;
          const isProtectedRoute = PROTECTED_ROUTES_EXACT.includes(currentPath) ||
            PROTECTED_ROUTES_PREFIX.some(
              (p) => currentPath === p || currentPath.startsWith(p + '/')
            );
          if (isProtectedRoute) {
            window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
          }
        }
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(err);
  }
)

export default api;