import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Transaksi</h1>
        <p className="text-muted-foreground">
          Kelola semua transaksi pemasukan dan pengeluaran Anda
        </p>
      </div>
      <TransactionList />
    </div>
  );
}
