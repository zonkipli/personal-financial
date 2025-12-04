"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { formatCurrency, getMonthName } from "@/lib/format";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface MonthlySummaryProps {
  month: number;
  year: number;
}

export function MonthlySummary({ month, year }: MonthlySummaryProps) {
  const { getMonthlyStats, transactions, categories } = useFinance();
  const { maskAmount } = usePrivacy();
  const { income, expense, balance } = getMonthlyStats(month, year);

  // Get previous month stats for comparison
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStats = getMonthlyStats(prevMonth, prevYear);

  const incomeChange =
    prevStats.income > 0
      ? ((income - prevStats.income) / prevStats.income) * 100
      : income > 0
      ? 100
      : 0;

  const expenseChange =
    prevStats.expense > 0
      ? ((expense - prevStats.expense) / prevStats.expense) * 100
      : expense > 0
      ? 100
      : 0;

  // Get top transactions
  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  const topIncome = [...monthlyTransactions]
    .filter((t) => t.type === "income")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const topExpense = [...monthlyTransactions]
    .filter((t) => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Lainnya";
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {/* Income Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total Pemasukan
          </CardTitle>
          <div className="rounded-lg bg-success/10 p-1.5 sm:p-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-success">
            {maskAmount(formatCurrency(income))}
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            {incomeChange >= 0 ? (
              <ArrowUpRight className="h-3 w-3 text-success" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-destructive" />
            )}
            <span
              className={
                incomeChange >= 0 ? "text-success" : "text-destructive"
              }
            >
              {Math.abs(incomeChange).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">
              vs {getMonthName(prevMonth)}
            </span>
          </div>

          {topIncome.length > 0 && (
            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Top Pemasukan
              </p>
              {topIncome.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs sm:text-sm gap-2"
                >
                  <span className="truncate">
                    {t.description || getCategoryName(t.categoryId)}
                  </span>
                  <span className="font-medium shrink-0">
                    {maskAmount(formatCurrency(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total Pengeluaran
          </CardTitle>
          <div className="rounded-lg bg-destructive/10 p-1.5 sm:p-2">
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-destructive">
            {maskAmount(formatCurrency(expense))}
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            {expenseChange <= 0 ? (
              <ArrowDownRight className="h-3 w-3 text-success" />
            ) : (
              <ArrowUpRight className="h-3 w-3 text-destructive" />
            )}
            <span
              className={
                expenseChange <= 0 ? "text-success" : "text-destructive"
              }
            >
              {Math.abs(expenseChange).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">
              vs {getMonthName(prevMonth)}
            </span>
          </div>

          {topExpense.length > 0 && (
            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Top Pengeluaran
              </p>
              {topExpense.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs sm:text-sm gap-2"
                >
                  <span className="truncate">
                    {t.description || getCategoryName(t.categoryId)}
                  </span>
                  <span className="font-medium shrink-0">
                    {maskAmount(formatCurrency(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card className="sm:col-span-2 md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Saldo Bulan Ini
          </CardTitle>
          <div
            className={`rounded-lg p-1.5 sm:p-2 ${
              balance >= 0 ? "bg-primary/10" : "bg-destructive/10"
            }`}
          >
            <Wallet
              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                balance >= 0 ? "text-primary" : "text-destructive"
              }`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-lg sm:text-2xl font-bold ${
              balance >= 0 ? "text-primary" : "text-destructive"
            }`}
          >
            {maskAmount(formatCurrency(balance))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {balance >= 0 ? "Surplus" : "Defisit"} keuangan bulan{" "}
            {getMonthName(month)}
          </p>

          <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Jumlah Transaksi</span>
              <span className="font-medium">{monthlyTransactions.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Rata-rata/Hari</span>
              <span className="font-medium">
                {maskAmount(
                  formatCurrency(expense / new Date(year, month, 0).getDate())
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
