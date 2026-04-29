import { getMyProfile } from "@/services/user.service";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";

export const GET_MY_PROFILE_QUERY_KEY = 'get-my-profile';

export const useGetMyProfile = () => {
  const controller = useRef<AbortController>(new AbortController());

  const { data, isLoading, isError } = useQuery({
    queryKey: [GET_MY_PROFILE_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getMyProfile(controller.current.signal);
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const userProfile = useMemo(() => data?.data, [data]);

  const abort = useCallback(() => {
    controller.current.abort();
  }, []);

  return {
    userProfile,
    isLoading,
    isError,
    abort,
  }
}