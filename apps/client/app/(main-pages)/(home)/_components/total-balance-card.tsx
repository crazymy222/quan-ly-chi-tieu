"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTotalBalance } from "@/hooks/useGetTotalBalance";
import { useShowBalanceStore } from "@/stores/useShowBalanceStore";
import { EyeClosedIcon, EyeIcon, HandCoinsIcon } from "lucide-react";

export default function TotalBalanceCard() {
  const { isShow, toggle } = useShowBalanceStore();
  const { totalBalance, isLoading } = useGetTotalBalance();
  
  return (
    <div className="flex flex-col gap-2 border border-border rounded-lg p-3">
      <div className="flex items-center gap-x-2">
        <HandCoinsIcon className="size-4" />
        <h2 className="font-semibold">Tổng tài sản</h2>
      </div>
      <div>
        {isLoading
          ? <Skeleton className="size-10 rounded-full" />
          : <div className="flex items-center gap-2">
            <span className="text-2xl font-bold items-center justify-center flex">
              {isShow ? totalBalance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
            </span>
            <Button variant="ghost" size="icon" onClick={toggle}>
              {isShow ? <EyeIcon /> : <EyeClosedIcon />}
            </Button>
          </div>
        }
      </div>
    </div>
  )
}