"use client"

import { useCreateWallet } from "@/hooks/useCreateWallet";
import { GET_PAGINATION_WALLET_QUERY_KEY } from "@/hooks/useGetInfiniteWallet";
import { GET_WALLET_COUNT_QUERY_KEY } from "@/hooks/useGetWalletCount";
import { useInvalidateQueries } from "@/hooks/useRevalidateQuery";
import { useCreateWalletDialogStore } from "@/stores/useCreateWalletDialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v3";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Spinner } from "./ui/spinner";
import { GET_TOTAL_BALANCE_QUERY_KEY } from "@/hooks/useGetTotalBalance";


export default function CreateWalletDialog() {
  const { isOpen, setIsOpen, close } = useCreateWalletDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      setIsOpen: state.setIsOpen,
      close: state.close,
    }))
  );
  const formId = useId();
  const invalidateQueries = useInvalidateQueries();

  const { createWallet, isPending } = useCreateWallet({
    onSuccess: () => {
      invalidateQueries([
        [GET_PAGINATION_WALLET_QUERY_KEY],
        [GET_WALLET_COUNT_QUERY_KEY],
        [GET_TOTAL_BALANCE_QUERY_KEY],
      ]
      );
      toast.success("Thêm ví thành công");
      close()
    },
    onError: () => toast.error("Đã xảy ra lỗi khi thêm ví, vui lòng thử lại sau."),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Thêm ví mới</DialogTitle>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar h-full flex flex-col flex-1 overflow-y-auto px-4">
          <CreateWalletForm formId={formId} onSubmit={createWallet} />
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
  name: z
    .string()
    .trim()
    .min(1, { message: "Tên ví là bắt buộc" }),
  accontNumber: z
    .string()
    .trim(),
  balance: z
    .number()
    .min(0, { message: "Số dư phải lớn hơn 0" }),
});

export type CreateWalletFormData = z.infer<typeof formSchema>

interface CreateWalletFormProps {
  formId: string;
  onSubmit: (data: CreateWalletFormData) => void;
}

function CreateWalletForm({ formId, onSubmit }: CreateWalletFormProps) {
  const form = useForm<CreateWalletFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      accontNumber: "",
      balance: 0,
    },
  });

  const handleSubmit = (data: CreateWalletFormData) => {
    onSubmit(data);
  }

  return (
    <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Tên ví</FieldLabel>
              <Input
                {...field}
                id={formId + field.name}
                aria-invalid={fieldState.invalid}
                type="text"
                placeholder="Nhập tên ví"
                required
                autoComplete="text"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="accontNumber"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Số tài khoản</FieldLabel>
              <Input
                {...field}
                id={formId + field.name}
                aria-invalid={fieldState.invalid}
                type="text"
                placeholder="Nhập số tài khoản"
                autoComplete="text"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="balance"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Số dư</FieldLabel>
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
      </FieldGroup>
    </form>
  )
}