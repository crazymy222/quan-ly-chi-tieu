"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod/v3";
import PasswordInput from "./password-input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegister } from "@/hooks/useRegister";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Email không hợp lệ" }),
  displayName: z
    .string()
    .optional(),
  password: z
    .string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
  confirmPassword: z
    .string()


}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Mật khẩu không khớp",
});

export type RegisterFormData = z.infer<typeof formSchema>

export default function RegisterForm() {
  const formId = useId();
  const params = useSearchParams();
  const fromUrl = params.get('from');
  const router = useRouter();

  const { register, status } = useRegister({
    onSuccess: () => {
      router.push(fromUrl ? fromUrl : '/');
    },
  });

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    register(data);
  }

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={formId + field.name}
                aria-invalid={fieldState.invalid}
                type="email"
                placeholder="m@example.com"
                required
                autoComplete="email"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="displayName"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Tên hiển thị</FieldLabel>
              <Input
                {...field}
                id={formId + field.name}
                aria-invalid={fieldState.invalid}
                type="text"
                placeholder="Nhập tên hiển thị"
                required
                autoComplete="name"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Mật khẩu</FieldLabel>
              <PasswordInput
                {...field}
                id={formId + field.name}
                aria-invalid={fieldState.invalid}
                required
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={formId + field.name}>Xác nhận mật khẩu</FieldLabel>
              <PasswordInput
                {...field}
                id={formId + field.name}
                aria-invalid={fieldState.invalid}
                required
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Field>
          <Button
            type="submit"
            form={formId}
            disabled={status === 'pending'}
          >
            {status === 'pending' ? <Loader2Icon className="size-4 animate-spin" /> : null}
            Đăng ký
          </Button>

          <FieldDescription className="text-center">
            Bạn đã có tài khoản? <Link href={`/login${fromUrl ? `?from=${fromUrl}` : ''}`}>Đăng nhập</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}