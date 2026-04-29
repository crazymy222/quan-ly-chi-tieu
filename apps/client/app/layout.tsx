import QueryClientContextProvider from "@/components/query-client-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Nunito, Sono } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const sono = Sono({
  variable: "--font-sono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "App quản lý chi tiêu",
    template: "%s | App quản lý chi tiêu"
  },
  description: "Quản lý chi tiêu cá nhân, sinh hoạt phí, thu nhập, và nhiều hơn nữa",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${nunito.variable} ${sono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-muted">
        <QueryClientContextProvider>
          {children}
          <Toaster />
        </QueryClientContextProvider>
      </body>
    </html>
  );
}
