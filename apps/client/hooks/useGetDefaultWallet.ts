import { getDefaultWallet } from "@/services/wallet.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const GET_DEFAULT_WALLET_QUERY_KEY = 'get-default-wallet';

export const useGetDefaultWallet = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [GET_DEFAULT_WALLET_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getDefaultWallet();
      return data?.data;
    },
  });

  const defaultWallet = useMemo(() => data ?? null, [data]);

  return { defaultWallet, isLoading, isError };
}