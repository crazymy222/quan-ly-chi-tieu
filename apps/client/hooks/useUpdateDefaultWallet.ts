import { updateDefaultWallet } from "@/services/wallet.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface Props {
  onSuccess?: () => void;
  onError?: (error: Error | AxiosError) => void;
}

export const useUpdateDefaultWallet = ({ onSuccess, onError }: Props = {}) => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (walletId: string) => {
      await updateDefaultWallet(walletId);
    },
    onSuccess,
    onError,
  });

  return { updateDefaultWallet: mutate, isPending };
};