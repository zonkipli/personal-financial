"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface SplitBillFormProps {
  onSuccess: () => void
}

interface Participant {
  name: string
  amount: string
}

export function SplitBillForm({ onSuccess }: SplitBillFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", amount: "" }
  ])

  const addParticipant = () => {
    setParticipants([...participants, { name: "", amount: "" }])
  }

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants]
    updated[index][field] = value
    setParticipants(updated)
  }

  const splitEqually = () => {
    const total = parseFloat(totalAmount) || 0
    const perPerson = (total / participants.length).toFixed(2)
    setParticipants(participants.map(p => ({ ...p, amount: perPerson })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const validParticipants = participants.filter(p => p.name && p.amount)
    if (validParticipants.length === 0) {
      alert("Tambahkan minimal 1 participant")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/split-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title,
          totalAmount: parseFloat(totalAmount),
          participants: validParticipants.map(p => ({
            name: p.name,
            amount: parseFloat(p.amount)
          }))
        })
      })

      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating split bill:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Judul Patungan</Label>
        <Input
          id="title"
          placeholder="Contoh: Makan di Resto ABC"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="totalAmount">Total Tagihan</Label>
        <Input
          id="totalAmount"
          type="number"
          step="0.01"
          placeholder="0"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Peserta</Label>
          <Button type="button" variant="outline" size="sm" onClick={splitEqually}>
            Bagi Rata
          </Button>
        </div>

        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Nama"
                value={participant.name}
                onChange={(e) => updateParticipant(index, "name", e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Jumlah"
                value={participant.amount}
                onChange={(e) => updateParticipant(index, "amount", e.target.value)}
                className="w-32"
              />
              {participants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeParticipant(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addParticipant}
          className="mt-2 w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Peserta
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Buat Patungan"}
      </Button>
    </form>
  )
}
