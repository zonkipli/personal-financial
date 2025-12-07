"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Account } from "@/types"

interface AccountTransferDialogProps {
  accounts: Account[]
  onSuccess: () => void
}

export function AccountTransferDialog({ accounts, onSuccess }: AccountTransferDialogProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (formData.fromAccountId === formData.toAccountId) {
      alert("Tidak bisa transfer ke akun yang sama")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/account-transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating transfer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fromAccountId">Dari Akun</Label>
        <Select value={formData.fromAccountId} onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih akun sumber" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} - {account.currency} {Number(account.balance).toLocaleString('id-ID')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="toAccountId">Ke Akun</Label>
        <Select value={formData.toAccountId} onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih akun tujuan" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} - {account.currency} {Number(account.balance).toLocaleString('id-ID')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Jumlah</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="date">Tanggal</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Catatan (Opsional)</Label>
        <Textarea
          id="description"
          placeholder="Keterangan transfer..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Memproses..." : "Transfer"}
      </Button>
    </form>
  )
}
