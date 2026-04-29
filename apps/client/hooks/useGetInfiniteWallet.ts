import { PAGINATION_LIMIT } from "@/constants/api.const";
import { getPaginationWallet } from "@/services/wallet.service";
import { Order, PaginationParams } from "@/types/api-response.type";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const GET_PAGINATION_WALLET_QUERY_KEY = 'get-pagination-wallet';

const DEFAULT_SORT_FIELD = 'createdAt';
const DEFAULT_ORDER = Order.DESC;

interface Props {
  params?: PaginationParams;
  enabled?: boolean;
}

export const useGetInfiniteWallet = ({ params, enabled }: Props = { enabled: true }) => {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [GET_PAGINATION_WALLET_QUERY_KEY, params],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await getPaginationWallet({
        page: pageParam,
        take: params?.take || PAGINATION_LIMIT,
        sortField: params?.sortField || DEFAULT_SORT_FIELD,
        order: params?.order || DEFAULT_ORDER,
        ...params
      })
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

  const { wallets, totalCount } = useMemo(() => ({
    wallets: data?.pages.flatMap((page) => page.items) ?? [],
    totalCount: data?.pages[0]?.count ?? 0,
  }), [data]);


  return {
    wallets,
    totalCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  }
}