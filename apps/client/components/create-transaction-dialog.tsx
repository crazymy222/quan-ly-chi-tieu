"use client"

import { TRANSACTION_CATEGORIES } from "@/constants/transaction.const";
import { useCreateTransaction } from "@/hooks/useCreateTransaction";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGetDefaultWallet } from "@/hooks/useGetDefaultWallet";
import { GET_PAGINATION_TRANSACTION_QUERY_KEY } from "@/hooks/useGetInfiniteTransaction";
import { GET_PAGINATION_WALLET_QUERY_KEY, useGetInfiniteWallet } from "@/hooks/useGetInfiniteWallet";
import { useGetReciever } from "@/hooks/useGetReciever";
import { GET_STATISTICS_QUERY_KEY } from "@/hooks/useGetStatistics";
import { GET_TOTAL_BALANCE_QUERY_KEY } from "@/hooks/useGetTotalBalance";
import { GET_TOTAL_TRANSACTION_QUERY_KEY } from "@/hooks/useGetTotalTransaction";
import { useInvalidateQueries } from "@/hooks/useRevalidateQuery";
import { cn } from "@/lib/utils";
import { useCreateTransactionDialogStore } from "@/stores/useCreateTransactionDialogStore";
import { useShowBalanceStore } from "@/stores/useShowBalanceStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, EyeIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v3";
import { useShallow } from "zustand/react/shallow";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import InfiniteScroll from "./ui/Infinite-scroll";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";

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
  amount: z.number().min(0),
  transactionCategory: z.enum(Object.values(TRANSACTION_CATEGORIES) as [string, ...string[]], { message: "Vui lòng chọn loại giao dịch" }),
  walletId: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng chọn ví" }),
  recieverId: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng chọn người nhận" }),
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
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [isOpenRecieverPopover, setIsOpenRecieverPopover] = useState(false);

  const { defaultWallet } = useGetDefaultWallet();

  const {
    wallets,
    totalCount,
    isLoading: isLoadingWallets,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useGetInfiniteWallet({
    params: {
      priorityId: defaultWallet?.id,
    }
  });

  const {
    recievers,
    totalCount: totalRecieversCount,
    isLoading: isLoadingRecievers,
    hasNextPage: hasNextPageRecievers,
    isFetchingNextPage: isFetchingNextPageRecievers,
    fetchNextPage: fetchNextPageRecievers
  } = useGetReciever({
    params: {
      search: debouncedSearch,
    }
  });

  const { isShow, toggle } = useShowBalanceStore(
    useShallow((state) => ({
      isShow: state.isShow,
      toggle: state.toggle,
    }))
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      transactionCategory: "",
      note: "",
      walletId: defaultWallet?.id ?? "",
      recieverId: "",
    },
  });

  const [walletId, recieverId] = form.watch(["walletId", "recieverId"]);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === walletId),
    [walletId, wallets]
  );
  const selectedReciever = useMemo(
    () => recievers.find((reciever) => reciever.id === recieverId),
    [recieverId, recievers]
  );

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedWallet && selectedWallet.balance < data.amount) {
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
                <SelectContent
                  position="popper"
                  className="min-w-0 w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width)"
                >
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
                                  <SelectItem
                                    key={wallet.id}
                                    value={wallet.id}
                                    textValue={wallet.name}
                                  >
                                    <span className="min-w-0 truncate">{wallet.name}</span>
                                    {wallet.id === defaultWallet?.id ? (
                                      <Badge className="text-white!">
                                        Ví mặc định
                                      </Badge>
                                    ) : null}
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
          name="recieverId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={formId + field.name}>Người nhận</FieldLabel>
              <Popover open={isOpenRecieverPopover} onOpenChange={setIsOpenRecieverPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between overflow-hidden font-normal"
                  >
                    <span className={cn(
                      "truncate",
                      !field.value && "text-muted-foreground"
                    )}>
                      {
                        field.value ? (selectedReciever?.displayName || selectedReciever?.email) : "Chọn người nhận"
                      }
                    </span>
                    <ChevronDownIcon className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) max-w-none p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Tìm kiếm người nhận"
                      className="h-9"
                      value={search}
                      onValueChange={(value) => setSearch(value)}
                    />
                    <CommandList>
                      {
                        isLoadingRecievers ? (
                          <div className="flex items-center justify-center py-4 opacity-50">
                            <Spinner className="size-4" />
                          </div>
                        ) : (
                          totalRecieversCount > 0 ? (
                            <CommandGroup>
                              {
                                recievers.map((reciever) => (
                                  <CommandItem
                                    key={reciever.id}
                                    value={reciever.id}
                                    showCheck={field.value === reciever.id}
                                    className="overflow-hidden gap-x-2"
                                    onSelect={() => {
                                      field.onChange(reciever.id);
                                      setIsOpenRecieverPopover(false);
                                    }}
                                  >
                                    <span className="truncate">
                                      {reciever?.displayName || reciever?.email}
                                    </span>
                                  </CommandItem>
                                ))
                              }
                              <InfiniteScroll
                                hasMore={hasNextPageRecievers}
                                isLoading={isFetchingNextPageRecievers}
                                next={fetchNextPageRecievers}
                              >
                                {hasNextPageRecievers && (
                                  <div className="flex items-center justify-center py-4 opacity-50">
                                    <Spinner className="size-4" />
                                  </div>
                                )}
                              </InfiniteScroll>
                            </CommandGroup>
                          ) : (
                            <CommandEmpty>
                              Không có người nhận hợp lệ nào
                            </CommandEmpty>
                          )

                        )
                      }
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                      <span className="min-w-0 flex-1 truncate">{category}</span>
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
              <FieldLabel htmlFor={formId + field.name}>Nội dung</FieldLabel>
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