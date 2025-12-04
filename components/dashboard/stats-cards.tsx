"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinance } from "@/contexts/finance-context"
import { usePrivacy } from "@/contexts/privacy-context"
import { formatCurrency, getCurrentMonth, getCurrentYear, getMonthName } from "@/lib/format"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"

export function StatsCards() {
  const { getMonthlyStats, getBudgetStatus } = useFinance()
  const { maskAmount } = usePrivacy()
  const month = getCurrentMonth()
  const year = getCurrentYear()

  const stats = getMonthlyStats(month, year)
  const budgetStatus = getBudgetStatus(month, year)

  const cards = [
    {
      title: "Total Pemasukan",
      value: maskAmount(formatCurrency(stats.income)),
      subtitle: `${getMonthName(month)} ${year}`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Pengeluaran",
      value: maskAmount(formatCurrency(stats.expense)),
      subtitle: `${getMonthName(month)} ${year}`,
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Saldo",
      value: maskAmount(formatCurrency(stats.balance)),
      subtitle: stats.balance >= 0 ? "Positif" : "Negatif",
      icon: Wallet,
      color: stats.balance >= 0 ? "text-primary" : "text-destructive",
      bgColor: stats.balance >= 0 ? "bg-primary/10" : "bg-destructive/10",
    },
    {
      title: "Sisa Anggaran",
      value: budgetStatus.budget > 0 ? maskAmount(formatCurrency(budgetStatus.remaining)) : "Belum diatur",
      subtitle: budgetStatus.budget > 0 ? `${budgetStatus.percentage.toFixed(0)}% terpakai` : "Atur anggaran bulanan",
      icon: PiggyBank,
      color: budgetStatus.remaining >= 0 ? "text-primary" : "text-destructive",
      bgColor: budgetStatus.remaining >= 0 ? "bg-primary/10" : "bg-destructive/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
