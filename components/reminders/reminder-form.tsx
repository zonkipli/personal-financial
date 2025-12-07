"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ReminderFormProps {
  onSuccess: () => void
}

const REMINDER_TYPES = [
  { value: "bill", label: "Tagihan" },
  { value: "debt", label: "Hutang/Piutang" },
  { value: "savings", label: "Target Tabungan" },
  { value: "recurring", label: "Transaksi Berulang" },
  { value: "other", label: "Lainnya" }
]

export function ReminderForm({ onSuccess }: ReminderFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    dueDate: "",
    reminderDate: "",
    type: "bill"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          amount: parseFloat(formData.amount) || 0
        })
      })

      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Judul Reminder</Label>
        <Input
          id="title"
          placeholder="Contoh: Bayar Listrik"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            {REMINDER_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Jumlah (Opsional)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="reminderDate">Tanggal Reminder</Label>
          <Input
            id="reminderDate"
            type="date"
            value={formData.reminderDate}
            onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Keterangan (Opsional)</Label>
        <Textarea
          id="description"
          placeholder="Detail tentang reminder ini..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Simpan Reminder"}
      </Button>
    </form>
  )
}
