"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface InvestmentFormProps {
  onSuccess: () => void
}

const INVESTMENT_TYPES = [
  { value: "stocks", label: "Saham" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "mutual-funds", label: "Reksadana" },
  { value: "gold", label: "Emas" },
  { value: "bonds", label: "Obligasi" },
  { value: "other", label: "Lainnya" }
]

export function InvestmentForm({ onSuccess }: InvestmentFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "stocks",
    symbol: "",
    quantity: "0",
    buyPrice: "",
    currentPrice: "",
    currency: "IDR",
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          quantity: parseFloat(formData.quantity) || 0,
          buyPrice: parseFloat(formData.buyPrice),
          currentPrice: parseFloat(formData.currentPrice)
        })
      })

      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating investment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nama Investasi</Label>
          <Input
            id="name"
            placeholder="Contoh: BBRI, Bitcoin, RDPU"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Tipe</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVESTMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="symbol">Symbol/Ticker (Opsional)</Label>
          <Input
            id="symbol"
            placeholder="BBRI, BTC, dll"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="quantity">Jumlah/Lot</Label>
          <Input
            id="quantity"
            type="number"
            step="0.000001"
            placeholder="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buyPrice">Harga Beli</Label>
          <Input
            id="buyPrice"
            type="number"
            step="0.01"
            placeholder="0"
            value={formData.buyPrice}
            onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="currentPrice">Harga Sekarang</Label>
          <Input
            id="currentPrice"
            type="number"
            step="0.01"
            placeholder="0"
            value={formData.currentPrice}
            onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Mata Uang</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IDR">IDR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="purchaseDate">Tanggal Beli</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Catatan (Opsional)</Label>
        <Textarea
          id="notes"
          placeholder="Catatan tentang investasi ini..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Simpan Investasi"}
      </Button>
    </form>
  )
}
