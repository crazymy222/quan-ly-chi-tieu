"use client"

import CreateWalletDialog from "@/components/create-wallet-dialog";
import CreateTransactionDialog from "@/components/create-transaction-dialog";
import Header from "@/components/header";
import TransactionHistoryDialog from "@/components/transaction-history-dialog";
import WalletManagementDialog from "@/components/wallet-management-content";

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="h-dvh overflow-hidden flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col p-2 overflow-y-auto">
        <div className="max-w-screen-2xl flex flex-col flex-1 w-full mx-auto border border-border rounded-xl p-3 bg-white overflow-y-auto">
          {children}
        </div>
      </div>
      <WalletManagementDialog />
      <CreateWalletDialog />
      <TransactionHistoryDialog />
      <CreateTransactionDialog />
    </div>
  )
}