import { LoginFormData } from "@/components/login-form";
import { RegisterFormData } from "@/components/register-form";
import api from "@/lib/axios";
import { DefaultResponse, RegisterResponse } from "@/types/api-response.type";
import { LoginResponse } from "@/types/api-response.type";

export const login = (body: LoginFormData) => api.post<DefaultResponse<LoginResponse>>('/auth/login', body);

export const register = (body: RegisterFormData) => api.post<DefaultResponse<RegisterResponse>>('/auth/register', body);

export const logout = () => api.post('/auth/logout');

export const refreshToken = () => api.post('/auth/refresh');
