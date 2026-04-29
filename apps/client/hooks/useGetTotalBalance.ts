import { getTotalBalance } from "@/services/wallet.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const GET_TOTAL_BALANCE_QUERY_KEY = 'get-total-balance'; 

export const useGetTotalBalance = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [GET_TOTAL_BALANCE_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getTotalBalance();
      return data?.data;
    },
  });

  const totalBalance = useMemo(() => data ?? 0, [data]);

  return {
    totalBalance,
    isLoading,
    isError,
  }
}