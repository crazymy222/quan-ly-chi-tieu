import api from "@/lib/axios";
import type { DefaultResponse } from "@/types/api-response.type";
import type { IUserProfile } from "@/types/user.type";

export const getMyProfile = (signal?: AbortSignal) => api.get<DefaultResponse<IUserProfile>>('/user/profile', { signal });