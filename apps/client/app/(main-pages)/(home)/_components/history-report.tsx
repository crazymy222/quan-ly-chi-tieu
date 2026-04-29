"use client"

import TransactionHistoryCard from "@/components/transaction-history-card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import InfiniteScroll from "@/components/ui/Infinite-scroll";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useGetInfiniteTransaction } from "@/hooks/useGetInfiniteTransaction";
// import { useGetInfiniteTransaction } from "@/hooks/useGetInfiniteTransaction";
import { useGetInfiniteWallet } from "@/hooks/useGetInfiniteWallet";
import { useGetStatistics } from "@/hooks/useGetStatistics";
import { useShowBalanceStore } from "@/stores/useShowBalanceStore";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export default function HistoryReport() {
  const isShowBalance = useShowBalanceStore((state) => state.isShow);
  const { wallets, isLoading: isLoadingWallets, totalCount: totalCountWallet, hasNextPage: hasNextPageWallet, isFetchingNextPage: isFetchingNextPageWallet, fetchNextPage: fetchNextPageWallet } = useGetInfiniteWallet();

  const [selectedWalletId, setSellectedWalletId] = useState<string | undefined>(undefined)
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    return {
      from: new Date(Date.UTC(y, m, 1)),
      to: new Date(Date.UTC(y, m + 1, 0)),
    };
  });

  const { statistics, isLoading: isStatisticsLoading } = useGetStatistics({
    walletId: selectedWalletId,
    fromDate: date?.from,
    toDate: date?.to,
  });

  const { transactions, totalCount, isLoading: isLoadingTransactions, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetInfiniteTransaction({
    params: {
      walletId: selectedWalletId,
      fromDate: date?.from,
      toDate: date?.to,
    },
    enabled: !!selectedWalletId && !!date?.from && !!date?.to,
  });


  useEffect(() => {
    if (wallets?.length > 0 && !selectedWalletId) {
      setSellectedWalletId(wallets[0]?.id);
    }
  }, [wallets, selectedWalletId]);

  return (
    <div className="flex-1 flex flex-col gap-2 border border-border rounded-lg p-3 overflow-y-auto">
      <div className="flex flex-col md:flex-row items-center gap-2">
        <Select
          value={selectedWalletId}
          onValueChange={setSellectedWalletId}
        >
          <SelectTrigger className="md:max-w-50 w-full">
            <SelectValue placeholder="Chọn ví" />
          </SelectTrigger>
          <SelectContent position="popper" className="md:max-w-50 w-full">
            <SelectGroup>
              {
                isLoadingWallets
                  ? (
                    <SelectItem disabled value="emtpy" className="justify-center">
                      <Spinner className="size-5" />
                    </SelectItem>
                  )
                  : (
                    totalCountWallet > 0 ? (
                      <>
                        {
                          wallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name}
                            </SelectItem>
                          ))
                        }
                        <InfiniteScroll
                          hasMore={hasNextPageWallet}
                          isLoading={isFetchingNextPageWallet}
                          next={fetchNextPageWallet}
                        >
                          {hasNextPageWallet && (
                            <SelectItem disabled value="emtpy" className="justify-center">
                              <Spinner className="size-5" />
                            </SelectItem>
                          )}
                        </InfiniteScroll>
                      </>
                    )
                      : (
                        <SelectItem disabled value="emtpy" className="justify-center">
                          <span className="text-muted-foreground">Bạn chưa có ví nào</span>
                        </SelectItem>
                      )
                  )
              }
            </SelectGroup>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal md:w-auto w-full"
            >
              <CalendarIcon />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy")} -{" "}
                    {format(date.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Chọn ngày</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        {
          isStatisticsLoading && isLoadingWallets
            ? (
              <div className="flex-1 grid place-items-center">
                <Spinner className="size-10" />
              </div>
            ) : statistics ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 overflow-hidden">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-green-100 p-3 space-y-1">
                      <p className="font-semibold text-green-800">
                        Tổng thu nhập trong kỳ
                      </p>
                      <span className="font-bold text-green-800 text-lg">
                        {isShowBalance ? statistics.totalIncome.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-red-100 p-3 space-y-1">
                      <p className="font-semibold text-red-800">
                        Tổng chi tiêu trong kỳ
                      </p>
                      <span className="font-bold text-red-800 text-lg">
                        {isShowBalance ? statistics.totalExpense.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '**********'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-yellow-100 p-3 space-y-1">
                      <p className="font-semibold text-yellow-800">
                        Số dư đầu kỳ
                      </p>
                      <Skeleton className="w-20 h-5 rounded-md" />
                    </div>
                    <div className="rounded-lg bg-blue-100 p-3 space-y-1">
                      <p className="font-semibold text-blue-800">
                        Số dư cuối kỳ
                      </p>
                      <Skeleton className="w-20 h-5 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col flex-1 bg-muted rounded-lg p-2 space-y-2 overflow-y-auto">
                  <p className="font-semibold">
                    Danh sách giao dịch
                  </p>
                  <ul className="flex flex-col flex-1 gap-2 overflow-y-auto">
                    {
                      isLoadingTransactions
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
                                <span className="text-muted-foreground text-sm font-semibold">
                                  Không có giao dịch nào
                                </span>
                              </li>
                            )
                        )
                    }

                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid place-items-center">
                <span className="text-muted-foreground text-sm font-semibold">
                  Vui lòng chọn ví và ngày để xem thống kê
                </span>
              </div>
            )
        }
      </div>
    </div>
  )
}