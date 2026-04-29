"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { useGetTotalTransaction } from "@/hooks/useGetTotalTransaction";
import { useShowBalanceStore } from "@/stores/useShowBalanceStore";
import { useTransactionHistoryDialogStore } from "@/stores/useTransactionHistoryDialogStore";
import { ArrowLeftRightIcon, BanknoteArrowDownIcon, BanknoteArrowUpIcon, ChevronRight } from "lucide-react";

export default function TransactionCard() {
  const { totalIncome, totalExpense, isLoading } = useGetTotalTransaction();
  const isShowBalance = useShowBalanceStore((state) => state.isShow);
  const toggleTransactionHistoryDialog = useTransactionHistoryDialogStore((state) => state.toggle);

  return (
    <button
      type="button"
      className="flex flex-col gap-2 border border-border rounded-lg p-3"
      onClick={() => toggleTransactionHistoryDialog()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ArrowLeftRightIcon className="size-4" />
          <h2 className="font-bold">Quản lý chi tiêu</h2>
        </div>
        <ChevronRight className="size-4" />
      </div>
      <div className="mt-auto text-left">
        <div>
          <div className="flex items-center gap-x-2">
            <span className="text-sm text-muted-foreground">Thu:</span>
            {
              isLoading
                ? <Skeleton className="size-4 max-w-20 w-full" />
                :
                <span className="text-sm font-bold flex items-center gap-x-1">
                  {isShowBalance ? totalIncome.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
                  <BanknoteArrowUpIcon className="size-4 text-green-400" />
                </span>
            }
          </div>
          <div className="flex items-center gap-x-2">
            <span className="text-sm text-muted-foreground">Chi:</span>
            {
              isLoading
                ? <Skeleton className="size-4 max-w-20 w-full" />
                :
                <span className="text-sm font-bold flex items-center gap-x-1">
                  {isShowBalance ? totalExpense.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
                  <BanknoteArrowDownIcon className="size-4 text-red-400 " />
                </span>
            }
          </div>
        </div>
      </div>
    </button>
  )
}