import { LoginFormData } from "@/components/login-form"
import { login } from "@/services/auth.service"
import { LoginResponse } from "@/types/api-response.type"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

interface Props {
  onSuccess?: (user: LoginResponse) => void,
  onError?: (error: Error | AxiosError) => void,
}

export const useLogin = ({ onError, onSuccess }: Props = {}) => {
  const queryClient = useQueryClient();

  const { isPending, mutate, status } = useMutation({
    mutationFn: async (body: LoginFormData) => {
      const { data } = await login(body);
      return data.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
      queryClient.clear();
    },
    onError
  })

  return {
    login: mutate,
    isPending,
    status,
  }
}