"use client"

import { NEXT_PUBLIC_API_URL } from "@/constants/env.const"
import { useLogin } from "@/hooks/useLogin"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, OctagonAlertIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod/v3"
import PasswordInput from "./password-input"
import { Alert, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"
import { toast } from "sonner"

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Email không hợp lệ" }),
  password: z.string(),
})

export type LoginFormData = z.infer<typeof formSchema>

export default function LoginForm() {
  const formId = useId();
  const router = useRouter();
  const params = useSearchParams();
  const fromUrl = params.get('from');

  const { login, status } = useLogin({
    onSuccess: () => {
      router.push(fromUrl ? fromUrl : '/');
    },
    onError: () => {
      toast.error("Đăng nhập thất bại vui lòng kiểm tra lại thông tin đăng nhập");
    }
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-4">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={formId + field.name}>Địa chỉ email</FieldLabel>
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
          {
            status === "error" &&
            <Alert className="border-none bg-destructive/10 text-destructive dark:bg-destructive/15">
              <OctagonAlertIcon className="size-4" />
              <AlertTitle>
                Đăng nhập thất bại vui lòng kiểm tra lại thông tin đăng nhập
              </AlertTitle>
            </Alert>
          }

        <Field>
          <Button
            type="submit"
            form={formId}
            disabled={status === 'pending'}
          >
            {status === 'pending' ? <Loader2Icon className="size-4 animate-spin" /> : null}
            Đăng nhập
          </Button>
          <FieldDescription className="text-center">
            Bạn chưa có tài khoản? <Link href={`/register${fromUrl ? `?from=${fromUrl}` : ''}`}>Đăng ký</Link>
          </FieldDescription>

          <div className="flex items-center justify-center gap-2 relative">
            <span className="bg-white px-2 z-10">Hoặc</span>
            <Separator className="absolute left-0 right-0 top-1/2 -translate-y-1/2" />
          </div>

          <Button
            type="button"
            variant={"outline"}
            onClick={() => {
              window.location.href = `${NEXT_PUBLIC_API_URL}/oauth/google`;
            }}
          >
            Đăng nhập với tài khoản Google
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}