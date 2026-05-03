import { PAGINATION_LIMIT } from "@/constants/api.const";
import { getTransactionHistory } from "@/services/transaction.service";
import { Order, PaginationParams } from "@/types/api-response.type";
import { GetStatisticsParams } from "@/types/transaction.type";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const GET_PAGINATION_TRANSACTION_QUERY_KEY = 'get-pagination-transaction';

interface Props {
  params?: Omit<PaginationParams, 'page'> & GetStatisticsParams;
  enabled?: boolean;
}


export const useGetInfiniteTransaction = ({ params, enabled }: Props = { enabled: true }) => {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [GET_PAGINATION_TRANSACTION_QUERY_KEY, params],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await getTransactionHistory({ page: pageParam, take: PAGINATION_LIMIT, order: Order.DESC, ...params })
      return data?.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalCount = lastPage.count;
      const hasNextPage = currentPage * PAGINATION_LIMIT < totalCount;
      return hasNextPage ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
  });

  const transactions = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const totalCount = useMemo(() => data?.pages[0]?.count ?? 0, [data]);

  return {
    transactions,
    totalCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  }
} 