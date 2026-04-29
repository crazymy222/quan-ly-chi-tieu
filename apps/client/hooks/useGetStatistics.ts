import { getStatistics } from "@/services/transaction.service";
import { GetStatisticsParams } from "@/types/transaction.type";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const GET_STATISTICS_QUERY_KEY = 'get-statistics';

export const useGetStatistics = (params: GetStatisticsParams) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [GET_STATISTICS_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await getStatistics(params);
      return data?.data;
    },
    enabled: !!params.walletId && !!params.fromDate && !!params.toDate,
  });

  const statistics = useMemo(() => {
    return data ? {
      totalIncome: data.totalIncome,
      totalExpense: data.totalExpense,
    } : null;        
  }, [data]);

  return {
    statistics,
    isLoading,
    isError,
  }
}