import { RegisterFormData } from "@/components/register-form";
import { register } from "@/services/auth.service";
import { RegisterResponse } from "@/types/api-response.type";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface Props {
  onSuccess?: (data: RegisterResponse) => void;
  onError?: (error: Error | AxiosError) => void;
}

export const useRegister = ({ onSuccess, onError }: Props = {}) => {
  const { mutate, isPending, status } = useMutation({
    mutationFn: async (body: RegisterFormData) => {
      const { data } = await register(body);
      return data.data;
    },
    onSuccess,
    onError,
  })

  return {
    register: mutate,
    isPending,
    status,
  }
}