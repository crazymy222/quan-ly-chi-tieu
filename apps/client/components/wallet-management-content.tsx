"use client"

import { GET_DEFAULT_WALLET_QUERY_KEY, useGetDefaultWallet } from "@/hooks/useGetDefaultWallet";
import { GET_PAGINATION_WALLET_QUERY_KEY, useGetInfiniteWallet } from "@/hooks/useGetInfiniteWallet";
import { useGetWalletCount } from "@/hooks/useGetWalletCount";
import { useInvalidateQueries } from "@/hooks/useRevalidateQuery";
import { useUpdateDefaultWallet } from "@/hooks/useUpdateDefaultWallet";
import { cn } from "@/lib/utils";
import { useCreateWalletDialogStore } from "@/stores/useCreateWalletDialogStore";
import { useShowBalanceStore } from "@/stores/useShowBalanceStore";
import { useWalletManagementDialogStore } from "@/stores/useWalletManagementDialogStore";
import { Wallet } from "@/types/wallet.type";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import InfiniteScroll from "./ui/Infinite-scroll";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";

export default function WalletManagementDialog() {
  const { isOpen, setIsOpen } = useWalletManagementDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      setIsOpen: state.setIsOpen,
    }))
  );
  const openCreateWalletDialog = useCreateWalletDialogStore((state) => state.toggle);

  const { defaultWallet } = useGetDefaultWallet();

  const { walletCount, isLoading } = useGetWalletCount();
  const {
    wallets,
    totalCount,
    isLoading: isLoadingWallets,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetInfiniteWallet({
    params: {
      priorityId: defaultWallet?.id,
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="gap-y-4 min-h-[50vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Quản lý ví</DialogTitle>
          <DialogDescription>
            Bạn đang có <span className="font-semibold">{isLoading ? <Skeleton className="size-4 max-w-20 w-full" /> : walletCount}</span> ví
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar flex-1 flex flex-col overflow-y-auto px-4">
          <ul className="flex flex-col flex-1 bg-muted rounded-lg p-2 gap-2">
            {
              isLoadingWallets
                ? (
                  <li className="fex-1 flex items-center justify-center py-1 flex-1">
                    <Spinner className="size-8" />
                  </li>
                )
                : (
                  totalCount > 0 ? (
                    <>
                      {
                        wallets.map((wallet, index) => (
                          <li key={wallet.id + index}>
                            <WalletCard
                              wallet={wallet}
                            />
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
                        <Button onClick={() => openCreateWalletDialog()}>
                          <PlusIcon className="size-4" />
                          <span>Tạo ví</span>
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
              <Button onClick={() => openCreateWalletDialog()}>
                <PlusIcon className="size-4" />
                <span>Tạo ví</span>
              </Button>
            </DialogFooter>
          )
        }
      </DialogContent>
    </Dialog>
  )
}

function WalletCard({ wallet }: { wallet: Wallet }) {
  const isShowBalance = useShowBalanceStore((state) => state.isShow);
  const [isOpen, setIsOpen] = useState(false);
  const { defaultWallet } = useGetDefaultWallet();

  const isDefaultWallet = useMemo(() => defaultWallet?.id === wallet.id, [defaultWallet, wallet]);
  const invalidateQueries = useInvalidateQueries();

  const { updateDefaultWallet, isPending } = useUpdateDefaultWallet({
    onSuccess: () => {
      invalidateQueries([
        [GET_DEFAULT_WALLET_QUERY_KEY],
        [GET_PAGINATION_WALLET_QUERY_KEY],
      ]);
      toast.success("Đặt ví mặc định thành công");
    },
    onError: () => {
      toast.error("Đã xảy ra lỗi khi đặt ví mặc định, vui lòng thử lại sau.");
    },
  });

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg p-3 pb-1.5 bg-white w-full",
        )}
      >
        <div className="flex items-center justify-between gap-x-4 w-full overflow-hidden">
          <h2
            className="font-semibold truncate"
            title={wallet.name}
          >
            {wallet.name}
          </h2>
          <span>
            {isShowBalance ? wallet.balance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
          </span>
        </div>
        <div className="flex items-center gap-x-2 justify-between">
          {
            !isDefaultWallet ? (
              <Button
                variant="link"
                size="xs"
                className="p-0"
                disabled={isPending}
                onClick={() => updateDefaultWallet(wallet.id)}
              >
                Đặt làm ví mặc định
              </Button>
            ) : (
              <span
                className="text-xs text-white font-semibold bg-primary rounded-md px-2 py-0.5"
                title="Nguồn nhận tiền mặc định"
              >
                Ví mặc định
              </span>
            )
          }
          <Button
            variant="link"
            size="xs"
            className="p-0"
            onClick={() => setIsOpen(true)}

          >
            Xem thông tin
          </Button>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Thông tin ví
            </DialogTitle>
          </DialogHeader>
          <div className="-mx-4 no-scrollbar flex-1 flex flex-col overflow-y-auto px-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Tên ví
                </p>
                <p className="text-sm font-semibold">
                  {wallet.name}
                </p>
              </div>
              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Số dư
                </p>
                <p className="text-sm font-semibold">
                  {isShowBalance ? wallet.balance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
                </p>
              </div>
              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Số tài khoản
                </p>
                <p className="text-sm font-semibold">
                  {wallet.accountNumber || 'Không có'}
                </p>
              </div>
              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Ngày tạo
                </p>
                <p className="text-sm font-semibold">
                  {format(wallet.createdAt, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}