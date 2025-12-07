"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AccountFormProps {
  onSuccess: () => void
}

const ACCOUNT_TYPES = [
  { value: "cash", label: "Uang Tunai" },
  { value: "bank", label: "Rekening Bank" },
  { value: "e-wallet", label: "E-Wallet" },
  { value: "credit-card", label: "Kartu Kredit" }
]

const ACCOUNT_ICONS = [
  "Wallet", "CreditCard", "Smartphone", "Banknote", "Building", "Landmark"
]

const COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"
]

export function AccountForm({ onSuccess }: AccountFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "cash",
    balance: "0",
    currency: "IDR",
    color: "#10b981",
    icon: "Wallet"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          balance: parseFloat(formData.balance) || 0
        })
      })

      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama Akun</Label>
        <Input
          id="name"
          placeholder="Contoh: BCA, GoPay, Cash"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Tipe Akun</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="balance">Saldo Awal</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          placeholder="0"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
        />
      </div>

      <div>
        <Label>Warna</Label>
        <div className="flex gap-2 mt-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-foreground' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Simpan Akun"}
      </Button>
    </form>
  )
}
