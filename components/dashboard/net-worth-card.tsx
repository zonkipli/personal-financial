"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, HandCoins } from "lucide-react"

export function NetWorthCard() {
  const { user } = useAuth()
  const [netWorth, setNetWorth] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadNetWorth = async () => {
      if (!user) return

      try {
        const [accountsRes, investmentsRes, debtsRes] = await Promise.all([
          fetch(`/api/accounts?userId=${user.id}`),
          fetch(`/api/investments?userId=${user.id}`),
          fetch(`/api/debts?userId=${user.id}`)
        ])

        const accountsData = await accountsRes.json()
        const investmentsData = await investmentsRes.json()
        const debtsData = await debtsRes.json()

        const accountsBalance = accountsData.totalBalance || 0
        const investmentsValue = investmentsData.totalValue || 0
        const totalAssets = accountsBalance + investmentsValue

        const debts = debtsData.debts || []
        const totalPayable = debts
          .filter((d: { type: string; isPaid: boolean }) => d.type === 'payable' && !d.isPaid)
          .reduce((sum: number, d: { amount: number }) => sum + Number(d.amount), 0)

        const totalReceivable = debts
          .filter((d: { type: string; isPaid: boolean }) => d.type === 'receivable' && !d.isPaid)
          .reduce((sum: number, d: { amount: number }) => sum + Number(d.amount), 0)

        const netAssets = totalAssets + totalReceivable
        const netWorthValue = netAssets - totalPayable

        setNetWorth({
          totalAssets: netAssets,
          totalLiabilities: totalPayable,
          netWorth: netWorthValue
        })
      } catch (error) {
        console.error("Error loading net worth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNetWorth()
  }, [user])

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">Loading...</div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Net Worth</p>
          <h2 className="text-3xl font-bold">
            Rp {netWorth.netWorth.toLocaleString('id-ID')}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Aset</p>
              <p className="font-semibold text-sm">
                Rp {netWorth.totalAssets.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <HandCoins className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Liabilitas</p>
              <p className="font-semibold text-sm">
                Rp {netWorth.totalLiabilities.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
