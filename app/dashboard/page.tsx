"use client"

import { useAuth } from "@/contexts/auth-context"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { BudgetAlert } from "@/components/dashboard/budget-alert"
import { NetWorthCard } from "@/components/dashboard/net-worth-card"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinance } from "@/contexts/finance-context"
import { usePrivacy } from "@/contexts/privacy-context"
import { getCurrentMonth, getCurrentYear, getMonthName, formatCurrency } from "@/lib/format"
import { Target, HandCoins, Repeat, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const { debts, savingsGoals, recurringTransactions } = useFinance()
  const { maskAmount } = usePrivacy()
  const month = getCurrentMonth()
  const year = getCurrentYear()

  const activeDebts = debts.filter((d) => !d.isPaid)
  const totalDebtAmount = activeDebts
    .filter((d) => d.type === "payable")
    .reduce((sum, d) => sum + d.amount, 0)
  const totalReceivableAmount = activeDebts
    .filter((d) => d.type === "receivable")
    .reduce((sum, d) => sum + d.amount, 0)

  const activeSavingsGoals = savingsGoals.filter((g) => !g.isCompleted)
  const totalSavingsTarget = activeSavingsGoals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalSavingsProgress = activeSavingsGoals.reduce((sum, g) => sum + g.currentAmount, 0)
  const savingsPercentage = totalSavingsTarget > 0 ? (totalSavingsProgress / totalSavingsTarget) * 100 : 0

  const activeRecurring = recurringTransactions.filter((r) => r.isActive)
  const monthlyRecurringIncome = activeRecurring
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0)
  const monthlyRecurringExpense = activeRecurring
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Selamat datang, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Ringkasan keuangan Anda untuk {getMonthName(month)} {year}
          </p>
        </div>
        <TransactionForm />
      </div>

      {/* Budget Alert */}
      <BudgetAlert />

      {/* Stats Cards */}
      <StatsCards />

      {/* Net Worth */}
      <NetWorthCard />

      {/* Additional Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Savings Goals Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Target Tabungan</CardTitle>
            <div className="rounded-lg p-2 bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {activeSavingsGoals.length}
                </div>
                <p className="text-xs text-muted-foreground">Target Aktif</p>
              </div>
              {activeSavingsGoals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{savingsPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={savingsPercentage} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{maskAmount(formatCurrency(totalSavingsProgress))}</span>
                    <span>{maskAmount(formatCurrency(totalSavingsTarget))}</span>
                  </div>
                </div>
              )}
              <Link href="/dashboard/savings">
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  Lihat Detail
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Debts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utang Piutang</CardTitle>
            <div className="rounded-lg p-2 bg-warning/10">
              <HandCoins className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-muted-foreground">Utang</span>
                  </div>
                  <p className="text-sm font-bold text-destructive">
                    {maskAmount(formatCurrency(totalDebtAmount))}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-muted-foreground">Piutang</span>
                  </div>
                  <p className="text-sm font-bold text-success">
                    {maskAmount(formatCurrency(totalReceivableAmount))}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Total Aktif</p>
                <p className="text-2xl font-bold">{activeDebts.length}</p>
              </div>
              <Link href="/dashboard/debts">
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  Kelola
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Transactions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Berulang</CardTitle>
            <div className="rounded-lg p-2 bg-info/10">
              <Repeat className="h-4 w-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{activeRecurring.length}</div>
                <p className="text-xs text-muted-foreground">Transaksi Aktif</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pemasukan/bulan</span>
                  <span className="text-sm font-medium text-success">
                    {maskAmount(formatCurrency(monthlyRecurringIncome))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pengeluaran/bulan</span>
                  <span className="text-sm font-medium text-destructive">
                    {maskAmount(formatCurrency(monthlyRecurringExpense))}
                  </span>
                </div>
              </div>
              <Link href="/dashboard/recurring">
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  Kelola
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  )
}
