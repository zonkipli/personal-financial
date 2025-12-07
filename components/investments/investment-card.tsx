"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, MoreVertical, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Investment } from "@/types"

interface InvestmentCardProps {
  investment: Investment
  onUpdate: () => void
}

export function InvestmentCard({ investment, onUpdate }: InvestmentCardProps) {
  const gainLoss = (Number(investment.currentPrice) - Number(investment.buyPrice)) * Number(investment.quantity)
  const gainLossPercentage = ((Number(investment.currentPrice) - Number(investment.buyPrice)) / Number(investment.buyPrice)) * 100
  const currentValue = Number(investment.currentPrice) * Number(investment.quantity)

  const handleDelete = async () => {
    if (!confirm(`Hapus investasi ${investment.name}?`)) return

    try {
      await fetch(`/api/investments/${investment.id}`, {
        method: "DELETE"
      })
      onUpdate()
    } catch (error) {
      console.error("Error deleting investment:", error)
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{investment.name}</h3>
            {investment.symbol && (
              <Badge variant="outline">{investment.symbol}</Badge>
            )}
          </div>
          <Badge>{investment.type}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Update Harga
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash className="h-4 w-4 mr-2" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Nilai Sekarang</span>
          <span className="font-semibold">
            {investment.currency} {currentValue.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Gain/Loss</span>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gainLoss >= 0 ? '+' : ''}{investment.currency} {Math.abs(gainLoss).toLocaleString('id-ID')}
            </span>
            {gainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Return</span>
          <span className={`font-semibold ${gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
          </span>
        </div>

        <div className="pt-3 border-t grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Harga Beli</p>
            <p className="font-medium">{investment.currency} {Number(investment.buyPrice).toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Qty</p>
            <p className="font-medium">{Number(investment.quantity)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
