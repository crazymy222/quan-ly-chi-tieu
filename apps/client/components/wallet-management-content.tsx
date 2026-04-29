"use client"

import { useGetInfiniteWallet } from "@/hooks/useGetInfiniteWallet";
import { useGetWalletCount } from "@/hooks/useGetWalletCount";
import { useCreateWalletDialogStore } from "@/stores/useCreateWalletDialogStore";
import { useShowBalanceStore } from "@/stores/useShowBalanceStore";
import { useWalletManagementDialogStore } from "@/stores/useWalletManagementDialogStore";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
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

  const { walletCount, isLoading } = useGetWalletCount();
  const { wallets, totalCount, isLoading: isLoadingWallets, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetInfiniteWallet();

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
                            <WalletCard wallet={wallet} />
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

  return (
    <>
      <button
        type="button"
        className="flex flex-col gap-2 rounded-lg p-3 bg-white w-full"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{wallet.name}</h2>
          </div>
          <span>
            {isShowBalance ? wallet.balance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
          </span>
        </div>
      </button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{wallet.name}</DialogTitle>
          </DialogHeader>
          <div className="-mx-4 no-scrollbar flex-1 flex flex-col overflow-y-auto px-4">
            <div className="flex flex-col gap-1.5">

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