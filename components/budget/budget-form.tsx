"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useFinance } from "@/contexts/finance-context"
import { getCurrentMonth, getCurrentYear, getMonthName } from "@/lib/format"
import type { Budget } from "@/types"
import { Plus, Loader2 } from "lucide-react"

interface BudgetFormProps {
  budget?: Budget
  onClose?: () => void
  trigger?: React.ReactNode
}

export function BudgetForm({ budget, onClose, trigger }: BudgetFormProps) {
  const { addBudget, updateBudget } = useFinance()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    amount: budget?.amount?.toString() || "",
    month: budget?.month?.toString() || getCurrentMonth().toString(),
    year: budget?.year?.toString() || getCurrentYear().toString(),
  })

  useEffect(() => {
    if (budget) {
      setFormData({
        amount: budget.amount.toString(),
        month: budget.month.toString(),
        year: budget.year.toString(),
      })
    }
  }, [budget])

  useEffect(() => {
    if (budget && !open) {
      setOpen(true)
    }
  }, [budget, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const data = {
      amount: Number.parseFloat(formData.amount),
      month: Number.parseInt(formData.month),
      year: Number.parseInt(formData.year),
      categoryId: null,
    }

    if (budget) {
      updateBudget(budget.id, data)
    } else {
      addBudget(data)
    }

    setIsLoading(false)
    setOpen(false)
    setFormData({
      amount: "",
      month: getCurrentMonth().toString(),
      year: getCurrentYear().toString(),
    })
    onClose?.()
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }))

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (getCurrentYear() - 2 + i).toString(),
    label: (getCurrentYear() - 2 + i).toString(),
  }))

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) onClose?.()
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Atur Anggaran
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Anggaran" : "Atur Anggaran Bulanan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahun</Label>
              <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Batas Anggaran (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Masukkan batas anggaran"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              Anda akan mendapat notifikasi jika pengeluaran mendekati atau melewati batas ini
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => {
                setOpen(false)
                onClose?.()
              }}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !formData.amount}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : budget ? (
                "Simpan Perubahan"
              ) : (
                "Simpan Anggaran"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
