import { PAGINATION_LIMIT } from "@/constants/api.const";
import { getReceivers } from "@/services/user.service";
import { Order } from "@/types/api-response.type";
import { GetReciverParams } from "@/types/user.type";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";

export const GET_PAGINATION_RECIEVER_KEY = 'get-reciever';

const DEFAULT_SORT_FIELD = 'createdAt';
const DEFAULT_ORDER = Order.DESC;

interface Props {
  params?: GetReciverParams;
  enabled?: boolean;
} 

export const useGetReciever = ({ params, enabled }: Props = { enabled: true, params: {} }) => {
  const controller = useRef<AbortController>(new AbortController());

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: [GET_PAGINATION_RECIEVER_KEY, params],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await getReceivers({
        page: pageParam,
        take: params?.take || PAGINATION_LIMIT,
        sortField: params?.sortField || DEFAULT_SORT_FIELD,
        order: params?.order || DEFAULT_ORDER,
        ...params
      },
      controller.current.signal
    )
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
  
  const { recievers, totalCount } = useMemo(() => ({
    recievers: data?.pages.flatMap((page) => page.items) ?? [],
    totalCount: data?.pages[0]?.count ?? 0,
  }), [data]);

  const abort = useCallback(() => {
    controller.current.abort();
  }, []);

  return {
    recievers,
    totalCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    abort,
  }
} 