import api from "@/lib/axios";
import type { DefaultResponse, GetManyResponse } from "@/types/api-response.type";
import type { GetReciverParams, IUserProfile } from "@/types/user.type";

export const getMyProfile = (signal?: AbortSignal) => api.get<DefaultResponse<IUserProfile>>('/user/profile', { signal });

export const getReceivers = (params: GetReciverParams, signal?: AbortSignal) => api.get<DefaultResponse<GetManyResponse<IUserProfile>>>('/user/receiver', { params, signal });