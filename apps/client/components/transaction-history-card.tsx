"use client"

import { TransactionType } from "@/constants/transaction.const";
import { useGetDetailTransaction } from "@/hooks/useGetDetailTransaction";
import { cn } from "@/lib/utils";
import { useShowBalanceStore } from "@/stores/useShowBalanceStore";
import { Transaction } from "@/types/transaction.type";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";

export default function TransactionHistoryCard({ transaction }: { transaction: Transaction }) {
  const isShowBalance = useShowBalanceStore((state) => state.isShow);
  const [isOpen, setIsOpen] = useState(false);

  const isIncome = useMemo(() => transaction.transactionType === TransactionType.INCOME, [transaction]);

  const { detailTransaction, isLoading } = useGetDetailTransaction({ id: transaction?.id, enabled: isOpen });

  return (
    <>
      <div
        className="bg-white rounded-lg p-2 flex flex-col gap-1 w-full"
      >
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold">{transaction.wallet.name}</p>
          <p className={cn('font-bold', isIncome ? 'text-green-500' : 'text-red-500')}>
            {
              isShowBalance
                ? (`${isIncome ? '+' : '-'}${transaction.amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`)
                : '**********'
            }
          </p>
        </div>
      
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {format(transaction.createdAt, 'dd/MM/yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">
            Số dư ví sau giao dịch: {
              isShowBalance
                ? transaction.balanceAfter.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                : '**********'
            }
          </p>
        </div>
        <div className="flex items-center justify-between gap-x-4">
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 w-fit">
            {transaction.transactionCategory}
          </span>
          <Button variant="link" className="p-0" onClick={() => setIsOpen(true)}>
            Xem chi tiết
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="gap-y-3">
          <DialogHeader className="gap-0.5">
            <DialogTitle className="text-lg font-bold">Chi tiết giao dịch</DialogTitle>
          </DialogHeader>
          <div className="-mx-4 no-scrollbar flex-1 flex flex-col overflow-y-auto px-4">
            <div className="flex flex-col gap-1.5">

              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Số tiền
                </p>
                <p className={cn('text-sm font-semibold', isIncome ? 'text-green-500' : 'text-red-500')}>
                  {
                    isShowBalance
                      ? (`${isIncome ? '+' : '-'}${transaction.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`)
                      : '**********'
                  }
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Thời gian
                </p>
                <p className="text-sm font-semibold">
                  {format(transaction.createdAt, 'dd/MM/yyyy')}
                </p>
              </div>

              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Danh mục
                </p>
                <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 w-fit">
                  {transaction.transactionCategory}
                </span>
              </div>

              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  {isIncome ? 'Người gửi' : 'Người nhận'}
                </p>
                {
                  isLoading ? <Skeleton className="w-20 h-4" /> :
                    <p className="text-sm font-semibold">
                      {detailTransaction?.peerUser?.displayName || detailTransaction?.peerUser?.email}
                    </p>
                }
              </div>

              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Ví
                </p>
                <p className="text-sm font-semibold">
                  {transaction.wallet.name}
                </p>
              </div>

              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Số dư trước giao dịch
                </p>
                <p className="text-sm font-semibold">
                  {isShowBalance ? transaction.balanceBefore.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Số dư ví sau giao dịch
                </p>
                <p className="text-sm font-semibold">
                  {isShowBalance ? transaction.balanceAfter.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
                </p>
              </div>
             
              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-muted-foreground">
                  Ghi chú
                </p>
                <p className="text-sm font-semibold">
                  {transaction.note}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}