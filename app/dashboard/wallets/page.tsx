"use client";

import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { WalletForm } from "@/components/wallets/wallet-form";
import { WalletCard } from "@/components/wallets/wallet-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";

export default function WalletsPage() {
  const { wallets, transactions } = useFinance();
  const { isAmountHidden } = usePrivacy();

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  // Calculate total income and expense for current month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return (
      date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
    );
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dompet</h1>
          <p className="text-muted-foreground">
            Kelola berbagai sumber uang Anda
          </p>
        </div>
        <WalletForm />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Saldo
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {isAmountHidden ? "••••••••" : formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {wallets.length} dompet aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Pemasukan Bulan Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-success">
              {isAmountHidden ? "••••••••" : formatCurrency(monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">dari semua dompet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Pengeluaran Bulan Ini
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-destructive">
              {isAmountHidden ? "••••••••" : formatCurrency(monthlyExpense)}
            </div>
            <p className="text-xs text-muted-foreground">dari semua dompet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Selisih
            </CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg sm:text-2xl font-bold ${
                monthlyIncome - monthlyExpense >= 0
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {isAmountHidden
                ? "••••••••"
                : formatCurrency(monthlyIncome - monthlyExpense)}
            </div>
            <p className="text-xs text-muted-foreground">bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet List */}
      {wallets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Dompet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Tambahkan dompet untuk mengelola berbagai sumber uang Anda seperti
              rekening bank, e-wallet, atau dompet tunai.
            </p>
            <WalletForm />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}
        </div>
      )}
    </div>
  );
}
