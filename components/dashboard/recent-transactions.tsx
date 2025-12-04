"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/contexts/finance-context"
import { usePrivacy } from "@/contexts/privacy-context"
import { formatCurrency, formatDate } from "@/lib/format"
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react"
import Link from "next/link"

export function RecentTransactions() {
  const { transactions, categories } = useFinance()
  const { maskAmount } = usePrivacy()

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Lainnya"
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "#6b7280"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transaksi Terbaru</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/transactions" className="flex items-center gap-1">
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Belum ada transaksi</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/transactions">Tambah Transaksi</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${getCategoryColor(transaction.categoryId)}20` }}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description || getCategoryName(transaction.categoryId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryName(transaction.categoryId)} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {maskAmount(formatCurrency(transaction.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Wallet({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  )
}
