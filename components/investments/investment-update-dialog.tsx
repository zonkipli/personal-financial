"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Investment } from "@/types"

interface InvestmentUpdateDialogProps {
  investment: Investment
  onSuccess: () => void
}

export function InvestmentUpdateDialog({ investment, onSuccess }: InvestmentUpdateDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPrice: String(investment.currentPrice),
    quantity: String(investment.quantity),
    notes: investment.notes
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const res = await fetch(`/api/investments/${investment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPrice: parseFloat(formData.currentPrice),
          quantity: parseFloat(formData.quantity),
          notes: formData.notes
        })
      })

      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error updating investment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="currentPrice">Harga Sekarang</Label>
        <Input
          id="currentPrice"
          type="number"
          step="0.01"
          value={formData.currentPrice}
          onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="quantity">Jumlah/Lot</Label>
        <Input
          id="quantity"
          type="number"
          step="0.000001"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Update Investasi"}
      </Button>
    </form>
  )
}
