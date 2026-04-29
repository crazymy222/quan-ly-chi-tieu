interface Wallet {
  id: string;
  name: string;
  balance: number;
  accountNumber: string | null;
  createdAt: Date;
  userId: string;
}