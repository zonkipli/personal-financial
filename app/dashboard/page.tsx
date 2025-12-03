"use client"

import { useAuth } from "@/contexts/auth-context"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { BudgetAlert } from "@/components/dashboard/budget-alert"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { getCurrentMonth, getCurrentYear, getMonthName } from "@/lib/format"

export default function DashboardPage() {
  const { user } = useAuth()
  const month = getCurrentMonth()
  const year = getCurrentYear()

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

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  )
}
