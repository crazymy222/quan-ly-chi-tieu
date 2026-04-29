import { CreateTransactionFormData } from "@/components/createTransactionDialog";
import { createTransaction } from "@/services/transaction.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface Props {
  onSuccess?: () => void;
  onError?: (error: Error | AxiosError) => void;
}

export const useCreateTransaction = ({ onSuccess, onError }: Props = {}) => {
  const { mutate, isPending, status } = useMutation({
    mutationFn: async (body: CreateTransactionFormData) => {
      const { data } = await createTransaction(body);
      return data.data;
    },
    onSuccess,
    onError,
  });

  return {
    createTransaction: mutate,
    isPending,
    status,
  }
}