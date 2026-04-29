import { getWalletCount } from "@/services/wallet.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const GET_WALLET_COUNT_QUERY_KEY = 'get-wallet-count';

export const useGetWalletCount = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [GET_WALLET_COUNT_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getWalletCount();
      return data?.data;
    },
  });

  const walletCount = useMemo(() => data ?? 0, [data]);

  return {
    walletCount,
    isLoading,
    isError,
  }
};