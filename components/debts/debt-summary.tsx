"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinance } from "@/contexts/finance-context"
import { usePrivacy } from "@/contexts/privacy-context"
import { formatCurrency } from "@/lib/format"
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react"

export function DebtSummary() {
  const { getDebtStats } = useFinance()
  const { maskAmount } = usePrivacy()
  const stats = getDebtStats()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{maskAmount(formatCurrency(stats.totalReceivable))}</div>
          <p className="text-xs text-muted-foreground">Uang yang akan diterima</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Utang</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{maskAmount(formatCurrency(stats.totalPayable))}</div>
          <p className="text-xs text-muted-foreground">Uang yang harus dibayar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {stats.balance >= 0 ? "+" : ""}
            {maskAmount(formatCurrency(stats.balance))}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.balance >= 0 ? "Lebih banyak piutang" : "Lebih banyak utang"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
