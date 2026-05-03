import { getDetailTransaction } from "@/services/transaction.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const GET_DETAIL_TRANSACTION_QUERY_KEY = 'get-detail-transaction';

interface Props {
  id: string;
  enabled?: boolean;
} 

export const useGetDetailTransaction = ({ id, enabled }: Props = { enabled: true, id: '' }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [GET_DETAIL_TRANSACTION_QUERY_KEY, id],
    queryFn: () => getDetailTransaction(id),
    enabled: !!id && enabled,
  });

  const detailTransaction = useMemo(() => data?.data?.data || null, [data]);

  return {
    detailTransaction,
    isLoading,
    isError
  }
};