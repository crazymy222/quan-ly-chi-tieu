"use client"

import { TRANSACTION_CATEGORIES, TransactionType } from "@/constants/transaction.const";
import { useCreateTransaction } from "@/hooks/useCreateTransaction";
import { GET_PAGINATION_WALLET_QUERY_KEY, useGetInfiniteWallet } from "@/hooks/useGetInfiniteWallet";
import { GET_TOTAL_BALANCE_QUERY_KEY } from "@/hooks/useGetTotalBalance";
import { useInvalidateQueries } from "@/hooks/useRevalidateQuery";
import { cn } from "@/lib/utils";
import { useCreateTransactionDialogStore } from "@/stores/useCreateTransactionDialogStore";
import { useShowBalanceStore } from "@/stores/useShowBalanceStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { BanknoteArrowDownIcon, BanknoteArrowUpIcon, CalendarIcon, EyeIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useId, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v3";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import InfiniteScroll from "./ui/Infinite-scroll";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";
import { GET_PAGINATION_TRANSACTION_QUERY_KEY } from "@/hooks/useGetInfiniteTransaction";
import { GET_TOTAL_TRANSACTION_QUERY_KEY } from "@/hooks/useGetTotalTransaction";
import { GET_STATISTICS_QUERY_KEY } from "@/hooks/useGetStatistics";

export default function CreateTransactionDialog() {
  const formId = useId();
  const { isOpen, setIsOpen, close } = useCreateTransactionDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      setIsOpen: state.setIsOpen,
      close: state.close,
    }))
  );

  const invalidateQueries = useInvalidateQueries();

  const { createTransaction, isPending } = useCreateTransaction({
    onSuccess: () => {
      invalidateQueries([
        [GET_PAGINATION_WALLET_QUERY_KEY],
        [GET_TOTAL_BALANCE_QUERY_KEY],
        [GET_PAGINATION_TRANSACTION_QUERY_KEY],
        [GET_TOTAL_TRANSACTION_QUERY_KEY],
        [GET_STATISTICS_QUERY_KEY]
      ]);
      toast.success("Thêm giao dịch thành công");
      close();
    },
    onError: () => toast.error("Đã xảy ra lỗi khi thêm giao dịch, vui lòng thử lại sau."),
  });

  const onSubmit = (data: CreateTransactionFormData) => {
    createTransaction(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Thêm giao dịch</DialogTitle>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar h-full flex flex-col flex-1 overflow-y-auto px-4">
          <CreateTransactionForm formId={formId} onSubmit={onSubmit} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button disabled={isPending} type="submit" form={formId}>
            {isPending && <Spinner className="size-4" />}
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const formSchema = z.object({
  transactionType: z.enum(Object.values(TransactionType) as [string, ...string[]], { message: "Vui lòng chọn loại giao dịch" }),
  amount: z.number().min(0),
  transactionDate: z
    .date({ message: "Vui lòng điền ngày giao dịch hợp lệ" })
    .refine((value) => new Date(value).getTime() <= new Date(new Date().setHours(0, 0, 0, 0)).getTime(), { message: "Ngày giao dịch không hợp lệ" }),
  transactionCategory: z.enum(Object.values(TRANSACTION_CATEGORIES) as [string, ...string[]], { message: "Vui lòng chọn loại giao dịch" }),
  walletId: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng chọn ví" }),
  note: z
    .string()
    .trim()
});

export type CreateTransactionFormData = z.infer<typeof formSchema>

interface CreateTransactionFormProps {
  formId: string;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

function CreateTransactionForm({ formId, onSubmit }: CreateTransactionFormProps) {
  const { wallets, totalCount, isLoading: isLoadingWallets, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetInfiniteWallet(); 4
  const { isShow, toggle } = useShowBalanceStore(
    useShallow((state) => ({
      isShow: state.isShow,
      toggle: state.toggle,
    }))
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: TransactionType.INCOME,
      amount: 0,
      transactionDate: undefined,
      transactionCategory: "",
      note: "",
      walletId: "",
    },
  });

  const [walletId] = form.watch(["walletId"]);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === walletId),
    [walletId, wallets]
  );

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedWallet && data.transactionType === TransactionType.EXPENSE && selectedWallet.balance < data.amount) {
      form.setError("amount", { message: "Số dư ví không đủ" });
      return;
    }
    onSubmit(data);
  }

  return (
    <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="py-2">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="walletId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={formId + field.name}>Ví</FieldLabel>
              <Select
                {...field}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value === "emtpy" ? "" : value);
                }}
              >
                <SelectTrigger aria-invalid={fieldState.invalid} id={formId + field.name}>
                  <SelectValue placeholder="Chọn ví" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {
                      isLoadingWallets
                        ? (
                          <SelectItem disabled value="emtpy" className="justify-center">
                            <Spinner className="size-5" />
                          </SelectItem>
                        )
                        : (
                          totalCount > 0 ? (
                            <>
                              {
                                wallets.map((wallet) => (
                                  <SelectItem key={wallet.id} value={wallet.id}>
                                    {wallet.name}
                                  </SelectItem>
                                ))
                              }
                              <InfiniteScroll
                                hasMore={hasNextPage}
                                isLoading={isFetchingNextPage}
                                next={fetchNextPage}
                              >
                                {hasNextPage && (
                                  <SelectItem disabled value="emtpy" className="justify-center">
                                    <Spinner className="size-5" />
                                  </SelectItem>
                                )}
                              </InfiniteScroll>
                            </>
                          )
                            : (
                              <SelectItem disabled value="emtpy">
                                <span className="text-muted-foreground">Bạn chưa có ví nào</span>
                              </SelectItem>
                            )
                        )
                    }
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedWallet && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Số dư: {isShow ? selectedWallet?.balance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : "**********"}
                  </span>
                  <Button variant="ghost" size="icon" className="size-6" onClick={toggle}>
                    <EyeIcon className="size-3" />
                  </Button>
                </div>
              )}
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="transactionType"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Loại giao dịch</FieldLabel>
              <RadioGroupPrimitive.Root
                className="grid w-full grid-cols-2 gap-3"
                value={field.value}
                onValueChange={field.onChange}
              >
                {Object.values(TransactionType).map((type) => (
                  <RadioGroupPrimitive.Item
                    className="rounded-lg px-3 py-2 ring-[1px] ring-border data-[state=checked]:ring-2 data-[state=checked]:ring-primary"
                    key={type}
                    value={type}
                  >
                    <div className={cn("flex items-center gap-2 justify-center",
                      field.value === type ? "text-primary" : ""
                    )}>
                      <span className="font-bold tracking-tight text-sm">{type === TransactionType.INCOME ? "Thu" : "Chi"}</span>
                      {
                        type === TransactionType.INCOME ? (
                          <BanknoteArrowDownIcon className="size-4" />
                        ) : (
                          <BanknoteArrowUpIcon className="size-4" />
                        )
                      }
                    </div>
                  </RadioGroupPrimitive.Item>
                ))}
              </RadioGroupPrimitive.Root>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="transactionCategory"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Loại giao dịch</FieldLabel>
              <Select
                {...field}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger aria-invalid={fieldState.invalid} id={formId + field.name}>
                  <SelectValue placeholder="Chọn loại giao dịch" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TRANSACTION_CATEGORIES).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="transactionDate"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Ngày giao dịch</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!field.value}
                    className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                  >
                    <CalendarIcon />
                    {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày giao dịch</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Số tiền</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={formId + field.name}
                  aria-invalid={fieldState.invalid}
                  value={new Intl.NumberFormat().format(
                    Number(field.value)
                  )}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    const numericValue = Number(value);
                    if (!isNaN(numericValue)) {
                      field.onChange(numericValue);
                    }
                  }}
                  type="text"
                  placeholder="Nhập số dư"
                  required
                  autoComplete="number"
                />
                <InputGroupAddon align="inline-end">
                  đ
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="note"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Ghi chú</FieldLabel>
              <Textarea
                {...field}
                id={formId + field.name}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />

      </FieldGroup>
    </form >
  )
}