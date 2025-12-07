"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InvestmentForm } from "@/components/investments/investment-form"
import { InvestmentCard } from "@/components/investments/investment-card"
import type { Investment } from "@/types"

export default function InvestmentsPage() {
  const { user } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [stats, setStats] = useState({
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const loadInvestments = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/investments?userId=${user.id}`)
      const data = await res.json()
      setInvestments(data.investments || [])
      setStats({
        totalValue: data.totalValue || 0,
        totalGainLoss: data.totalGainLoss || 0,
        totalGainLossPercentage: data.totalGainLossPercentage || 0
      })
    } catch (error) {
      console.error("Error loading investments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInvestments()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Investasi</h1>
          <p className="text-muted-foreground">Tracking saham, crypto, reksadana, dan investasi lainnya</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Investasi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Investasi Baru</DialogTitle>
            </DialogHeader>
            <InvestmentForm
              onSuccess={() => {
                setIsAddOpen(false)
                loadInvestments()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Nilai Portfolio</p>
          <p className="text-2xl font-bold">Rp {stats.totalValue.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Gain/Loss</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${stats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {Math.abs(stats.totalGainLoss).toLocaleString('id-ID')}
            </p>
            {stats.totalGainLoss >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Return Percentage</p>
          <p className={`text-2xl font-bold ${stats.totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.totalGainLossPercentage >= 0 ? '+' : ''}{stats.totalGainLossPercentage.toFixed(2)}%
          </p>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : investments.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Belum ada investasi</h3>
          <p className="text-muted-foreground mb-4">
            Mulai tracking investasi Anda untuk monitor performa portfolio
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Investasi Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {investments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              onUpdate={loadInvestments}
            />
          ))}
        </div>
      )}
    </div>
  )
}
