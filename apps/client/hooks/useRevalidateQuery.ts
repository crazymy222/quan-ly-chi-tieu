import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback((queryKeys: string[][]) => {
    Promise.allSettled([
      ...queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    ]);
  }, [queryClient]);

  return invalidateQueries;
}