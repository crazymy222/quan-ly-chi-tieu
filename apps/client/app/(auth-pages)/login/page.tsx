import { Metadata } from "next";
import LoginForm from "@/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào hệ thống",
}

export default function LoginPage() {
  return (
    <main className="flex-1 grid place-items-center">
      <div className="max-w-md w-full mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập vào tài khoản của bạn</CardTitle>
            <CardDescription>
              Chào mừng bạn quay trở lại! Đăng nhập vào app để tiếp tục quản lý chi tiêu của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}