"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinance } from "@/contexts/finance-context"
import type { Debt } from "@/types"
import { Plus } from "lucide-react"

interface DebtFormProps {
  debt?: Debt
  trigger?: React.ReactNode
}

export function DebtForm({ debt, trigger }: DebtFormProps) {
  const { addDebt, updateDebt } = useFinance()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: debt?.type || ("receivable" as "receivable" | "payable"),
    personName: debt?.personName || "",
    amount: debt?.amount?.toString() || "",
    description: debt?.description || "",
    dueDate: debt?.dueDate || "",
  })

  useEffect(() => {
    if (debt) {
      setFormData({
        type: debt.type,
        personName: debt.personName,
        amount: debt.amount.toString(),
        description: debt.description,
        dueDate: debt.dueDate || "",
      })
    }
  }, [debt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const debtData = {
      type: formData.type as "receivable" | "payable",
      personName: formData.personName,
      amount: Number.parseFloat(formData.amount),
      description: formData.description,
      dueDate: formData.dueDate || null,
      isPaid: debt?.isPaid || false,
      paidDate: debt?.paidDate || null,
    }

    if (debt) {
      updateDebt(debt.id, debtData)
    } else {
      addDebt(debtData)
    }

    setOpen(false)
    if (!debt) {
      setFormData({
        type: "receivable",
        personName: "",
        amount: "",
        description: "",
        dueDate: "",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Utang/Piutang
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{debt ? "Edit Utang/Piutang" : "Tambah Utang/Piutang"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipe</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "receivable" | "payable") => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receivable">Piutang (Orang lain berhutang ke saya)</SelectItem>
                <SelectItem value="payable">Utang (Saya berhutang ke orang lain)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personName">Nama Orang</Label>
            <Input
              id="personName"
              value={formData.personName}
              onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
              placeholder="Nama orang yang berhutang/meminjamkan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Nominal</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Tanggal Jatuh Tempo (Opsional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            {debt ? "Simpan Perubahan" : "Tambah"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
