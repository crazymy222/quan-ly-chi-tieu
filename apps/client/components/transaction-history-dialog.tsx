"use client"

import { useGetInfiniteTransaction } from "@/hooks/useGetInfiniteTransaction";
import { useCreateTransactionDialogStore } from "@/stores/useCreateTransactionDialogStore";
import { useTransactionHistoryDialogStore } from "@/stores/useTransactionHistoryDialogStore";
import { PlusIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import TransactionHistoryCard from "./transaction-history-card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import InfiniteScroll from "./ui/Infinite-scroll";
import { Spinner } from "./ui/spinner";

export default function TransactionHistoryDialog() {
  const { isOpen, setIsOpen } = useTransactionHistoryDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      setIsOpen: state.setIsOpen,
    }))
  );
  const open = useCreateTransactionDialogStore((state) => state.open);
  const {
    transactions,
    totalCount,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useGetInfiniteTransaction({
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="gap-y-4 min-h-[50vh]">
        <DialogHeader>
          <div>
            <DialogTitle className="text-lg font-bold">Lịch sử thu chi</DialogTitle>
          </div>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar h-full flex flex-col flex-1 overflow-y-auto px-4">
          <ul className="flex flex-col flex-1 bg-muted rounded-lg p-2 gap-2">
            {
              isLoading
                ? (
                  <li className="fex-1 flex items-center justify-center py-1 flex-1">
                    <Spinner className="size-8" />
                  </li>
                )
                : (
                  totalCount > 0 ? (
                    <>
                      {
                        transactions.map((transaction) => (
                          <li key={transaction.id}>
                            <TransactionHistoryCard transaction={transaction} />
                          </li>
                        ))
                      }
                      <InfiniteScroll
                        hasMore={hasNextPage}
                        isLoading={isFetchingNextPage}
                        next={fetchNextPage}
                      >
                        {hasNextPage && (
                          <li className="justify-center w-full justify-items-center py-2">
                            <Spinner className="size-4" />
                          </li>
                        )}
                      </InfiniteScroll>
                    </>
                  )
                    : (
                      <li className="flex-1 flex items-center justify-center py-1">
                        <Button onClick={open}>
                          <PlusIcon className="size-4" />
                          <span>Thêm giao dịch</span>
                        </Button>
                      </li>
                    )
                )
            }

          </ul>
        </div>
        {
          totalCount > 0 && (
            <DialogFooter>
              <Button onClick={open}>
                <PlusIcon className="size-4" />
                <span>Thêm giao dịch</span>
              </Button>
            </DialogFooter>
          )
        }
      </DialogContent>
    </Dialog>
  )
}

