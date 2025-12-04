"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinance } from "@/contexts/finance-context"
import { usePrivacy } from "@/contexts/privacy-context"
import { formatCurrency, formatDate } from "@/lib/format"
import { HandCoins, Wallet, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DebtSummaryReport() {
  const { debts } = useFinance()
  const { maskAmount } = usePrivacy()

  // Calculate statistics
  const activeDebts = debts.filter((d) => !d.isPaid)
  const paidDebts = debts.filter((d) => d.isPaid)

  const totalReceivable = activeDebts.filter((d) => d.type === "receivable").reduce((sum, d) => sum + d.amount, 0)

  const totalPayable = activeDebts.filter((d) => d.type === "payable").reduce((sum, d) => sum + d.amount, 0)

  const balance = totalReceivable - totalPayable

  // Overdue debts
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueDebts = activeDebts.filter((d) => {
    if (!d.dueDate) return false
    const dueDate = new Date(d.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  })

  const upcomingDebts = activeDebts
    .filter((d) => {
      if (!d.dueDate) return false
      const dueDate = new Date(d.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return dueDate >= today && dueDate <= nextWeek
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  // Top debtors/creditors
  const debtorMap = new Map<string, number>()
  const creditorMap = new Map<string, number>()

  activeDebts.forEach((d) => {
    if (d.type === "receivable") {
      debtorMap.set(d.personName, (debtorMap.get(d.personName) || 0) + d.amount)
    } else {
      creditorMap.set(d.personName, (creditorMap.get(d.personName) || 0) + d.amount)
    }
  })

  const topDebtors = Array.from(debtorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topCreditors = Array.from(creditorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Piutang</CardTitle>
            <div className="rounded-lg bg-green-500/10 p-2">
              <HandCoins className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{maskAmount(formatCurrency(totalReceivable))}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeDebts.filter((d) => d.type === "receivable").length} orang
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Utang</CardTitle>
            <div className="rounded-lg bg-red-500/10 p-2">
              <Wallet className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{maskAmount(formatCurrency(totalPayable))}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeDebts.filter((d) => d.type === "payable").length} orang
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Bersih</CardTitle>
            <div className={`rounded-lg p-2 ${balance >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
              <Users className={`h-4 w-4 ${balance >= 0 ? "text-primary" : "text-destructive"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
              {maskAmount(formatCurrency(balance))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance >= 0 ? "Lebih banyak piutang" : "Lebih banyak utang"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sudah Lunas</CardTitle>
            <div className="rounded-lg bg-success/10 p-2">
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidDebts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">dari {debts.length} total catatan</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue and Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overdue */}
        <Card className={overdueDebts.length > 0 ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle
                className={`h-5 w-5 ${overdueDebts.length > 0 ? "text-destructive" : "text-muted-foreground"}`}
              />
              Jatuh Tempo Terlewat
              {overdueDebts.length > 0 && <Badge variant="destructive">{overdueDebts.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueDebts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Tidak ada utang/piutang yang jatuh tempo terlewat</p>
            ) : (
              <div className="space-y-3">
                {overdueDebts.slice(0, 5).map((debt) => (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                  >
                    <div>
                      <p className="font-medium">{debt.personName}</p>
                      <p className="text-xs text-muted-foreground">Jatuh tempo: {formatDate(debt.dueDate!)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${debt.type === "receivable" ? "text-green-600" : "text-red-600"}`}>
                        {maskAmount(formatCurrency(debt.amount))}
                      </p>
                      <Badge variant={debt.type === "receivable" ? "default" : "secondary"} className="text-xs">
                        {debt.type === "receivable" ? "Piutang" : "Utang"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-warning" />
              Jatuh Tempo Minggu Ini
              {upcomingDebts.length > 0 && <Badge variant="outline">{upcomingDebts.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDebts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Tidak ada utang/piutang yang jatuh tempo minggu ini</p>
            ) : (
              <div className="space-y-3">
                {upcomingDebts.slice(0, 5).map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{debt.personName}</p>
                      <p className="text-xs text-muted-foreground">Jatuh tempo: {formatDate(debt.dueDate!)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${debt.type === "receivable" ? "text-green-600" : "text-red-600"}`}>
                        {maskAmount(formatCurrency(debt.amount))}
                      </p>
                      <Badge variant={debt.type === "receivable" ? "default" : "secondary"} className="text-xs">
                        {debt.type === "receivable" ? "Piutang" : "Utang"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Debtors and Creditors */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Debtors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Piutang (Orang yang Berhutang)</CardTitle>
          </CardHeader>
          <CardContent>
            {topDebtors.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada data piutang</p>
            ) : (
              <div className="space-y-3">
                {topDebtors.map(([name, amount], index) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{name}</p>
                    </div>
                    <p className="font-semibold text-green-600">{maskAmount(formatCurrency(amount))}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Creditors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Utang (Orang yang Anda Hutangi)</CardTitle>
          </CardHeader>
          <CardContent>
            {topCreditors.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada data utang</p>
            ) : (
              <div className="space-y-3">
                {topCreditors.map(([name, amount], index) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{name}</p>
                    </div>
                    <p className="font-semibold text-red-600">{maskAmount(formatCurrency(amount))}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
