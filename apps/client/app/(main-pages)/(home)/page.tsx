import HistoryReport from "./_components/history-report";
import TotalBalanceCard from "./_components/total-balance-card";
import TransactionCard from "./_components/transaction-card";
import WalletCard from "./_components/wallet-card";

export default async function HomePage() {
  return (
    <main className="flex flex-col gap-3 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TotalBalanceCard />
        <WalletCard />
        <TransactionCard />
      </div>
      <HistoryReport />
    </main>
  );
}
