import { useQuery } from "@tanstack/react-query";
import { getTotalIncomeAndExpense } from "@/services/transaction.service";
import { useMemo } from "react";

export const GET_TOTAL_TRANSACTION_QUERY_KEY = 'get-total-transaction';

export const useGetTotalTransaction = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [GET_TOTAL_TRANSACTION_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getTotalIncomeAndExpense();
      return data?.data;
    },
  });

  const { totalIncome, totalExpense } = useMemo(() => ({
    totalIncome: data?.totalIncome ?? 0,
    totalExpense: data?.totalExpense ?? 0,
  }), [data]);

  return {
    totalIncome,
    totalExpense,
    isLoading,
    isError
  }
}