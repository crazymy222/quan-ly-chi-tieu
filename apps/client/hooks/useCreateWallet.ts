import { CreateWalletFormData } from "@/components/create-wallet-dialog";
import { createWallet } from "@/services/wallet.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface Props {
  onSuccess?: (data: Wallet) => void;
  onError?: (error: Error | AxiosError) => void;
}

export const useCreateWallet = ({ onSuccess, onError }: Props = {}) => {
  const { mutate, isPending, status } = useMutation({
    mutationFn: async (body: CreateWalletFormData) => {
      const { data } = await createWallet(body);
      return data.data;
    },
    onSuccess,
    onError,
  });

  return {
    createWallet: mutate,
    isPending,
    status,
  }
};