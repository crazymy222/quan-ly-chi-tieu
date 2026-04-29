import RegisterForm from "@/components/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Đăng ký tài khoản của bạn",
}

export default function RegisterPage() {
  return (
    <main className="flex-1 grid place-items-center">
      <div className="max-w-md w-full mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Đăng ký tài khoản của bạn</CardTitle>
            <CardDescription>
              Chào mừng bạn đến với app! Đăng ký tài khoản để tiếp tục quản lý chi tiêu của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}