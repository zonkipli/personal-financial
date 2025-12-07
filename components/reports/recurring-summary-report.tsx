"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { formatCurrency } from "@/lib/format";
import {
  Repeat,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RecurringSummaryReport() {
  const { recurringTransactions, categories } = useFinance();
  const { maskAmount } = usePrivacy();

  const activeRecurring = recurringTransactions.filter((r) => r.isActive);
  const inactiveRecurring = recurringTransactions.filter((r) => !r.isActive);

  const incomeRecurring = activeRecurring.filter((r) => r.type === "income");
  const expenseRecurring = activeRecurring.filter((r) => r.type === "expense");

  const totalMonthlyIncome = incomeRecurring.reduce(
    (sum, r) => sum + r.amount,
    0
  );
  const totalMonthlyExpense = expenseRecurring.reduce(
    (sum, r) => sum + r.amount,
    0
  );
  const netCashFlow = totalMonthlyIncome - totalMonthlyExpense;

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Tidak ada";
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
      yearly: "Tahunan",
    };
    return labels[frequency] || frequency;
  };

  const sortedActive = [...activeRecurring].sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transaksi Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{activeRecurring.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pemasukan/Bulan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold text-success">
                {maskAmount(formatCurrency(totalMonthlyIncome))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengeluaran/Bulan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold text-destructive">
                {maskAmount(formatCurrency(totalMonthlyExpense))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Arus Kas Bersih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span
                className={`text-2xl font-bold ${
                  netCashFlow >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {maskAmount(formatCurrency(netCashFlow))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Analisis Arus Kas Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span>Total Pemasukan Berulang</span>
                </div>
                <p className="text-2xl font-bold text-success">
                  {maskAmount(formatCurrency(totalMonthlyIncome))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dari {incomeRecurring.length} transaksi aktif
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span>Total Pengeluaran Berulang</span>
                </div>
                <p className="text-2xl font-bold text-destructive">
                  {maskAmount(formatCurrency(totalMonthlyExpense))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dari {expenseRecurring.length} transaksi aktif
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Arus Kas Bersih:</span>
                <span
                  className={`text-xl font-bold ${
                    netCashFlow >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {maskAmount(formatCurrency(netCashFlow))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {netCashFlow >= 0
                  ? "Pemasukan rutin lebih besar dari pengeluaran rutin"
                  : "Pengeluaran rutin lebih besar dari pemasukan rutin"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Recurring Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Detail Transaksi Berulang Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedActive.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Repeat className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Belum ada transaksi berulang aktif</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedActive.map((recurring) => (
                <div
                  key={recurring.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`rounded-lg p-2 ${
                        recurring.type === "income"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      {recurring.type === "income" ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">
                        {recurring.description}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(recurring.categoryId)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {getFrequencyLabel(recurring.frequency)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p
                      className={`text-lg font-bold ${
                        recurring.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {recurring.type === "income" ? "+" : "-"}
                      {maskAmount(formatCurrency(recurring.amount))}
                    </p>
                    {recurring.frequency !== "monthly" && (
                      <p className="text-xs text-muted-foreground">
                        ~{maskAmount(formatCurrency(recurring.amount))}/bulan
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Recurring Transactions */}
      {inactiveRecurring.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Transaksi Berulang Nonaktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactiveRecurring.map((recurring) => (
                <div
                  key={recurring.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate text-muted-foreground">
                      {recurring.description}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {getCategoryName(recurring.categoryId)} •{" "}
                      {getFrequencyLabel(recurring.frequency)}
                    </p>
                  </div>
                  <Badge variant="secondary">Nonaktif</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
