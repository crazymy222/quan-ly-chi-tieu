"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { useGetWalletCount } from "@/hooks/useGetWalletCount";
import { useWalletManagementDialogStore } from "@/stores/useWalletManagementDialogStore";
import { ChevronRight, WalletIcon } from "lucide-react";

export default function WalletCard() {
  const { walletCount, isLoading } = useGetWalletCount();
  const toggleWalletManagementDialog = useWalletManagementDialogStore((state) => state.toggle)

  return (
    <button
      type="button"
      className="flex flex-col gap-2 border border-border rounded-lg p-3"
      onClick={() => toggleWalletManagementDialog()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <WalletIcon className="size-4" />
          <h2 className="font-bold">Quản lý ví</h2>
        </div>
        <ChevronRight className="size-4" />
      </div>
      <div className="mt-auto text-left">
        {
          isLoading ?
            <Skeleton className="size-4 max-w-20 w-full" />
            :
            <span className="text-sm text-muted-foreground">
              {`Bạn có ${walletCount} ví`}
            </span>
        }
      </div>
    </button>
  )
}