import { logout } from "@/services/auth.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Props {
  onSuccess?: () => void,
  onError?: (error: Error | AxiosError) => void,
  onSettled?: () => void,
}

export const useLogout = ({ onSuccess, onError, onSettled }: Props = {}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isPending, mutate, status } = useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess,
    onError,
    onSettled: () => {
      onSettled?.();
      queryClient.clear();
      router.push('/login');
    }
  })

  return {
    isPending,
    logout: mutate,
    status
  }
}