"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useFinance } from "@/contexts/finance-context"
import type { Transaction } from "@/types"
import { Plus, Loader2 } from "lucide-react"

interface TransactionFormProps {
  transaction?: Transaction
  onClose?: () => void
  trigger?: React.ReactNode
}

export function TransactionForm({ transaction, onClose, trigger }: TransactionFormProps) {
  const { categories, addTransaction, updateTransaction } = useFinance()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    type: transaction?.type || ("expense" as "income" | "expense"),
    categoryId: transaction?.categoryId || "",
    amount: transaction?.amount?.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date || new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        categoryId: transaction.categoryId,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date,
      })
    }
  }, [transaction])

  const filteredCategories = categories.filter((c) => c.type === formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const data = {
      type: formData.type,
      categoryId: formData.categoryId,
      amount: Number.parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
    }

    if (transaction) {
      updateTransaction(transaction.id, data)
    } else {
      addTransaction(data)
    }

    setIsLoading(false)
    setOpen(false)
    setFormData({
      type: "expense",
      categoryId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
    onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Transaksi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipe Transaksi</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.type === "income" ? "default" : "outline"}
                className={formData.type === "income" ? "bg-success hover:bg-success/90" : ""}
                onClick={() => setFormData({ ...formData, type: "income", categoryId: "" })}
              >
                Pemasukan
              </Button>
              <Button
                type="button"
                variant={formData.type === "expense" ? "default" : "outline"}
                className={formData.type === "expense" ? "bg-destructive hover:bg-destructive/90" : ""}
                onClick={() => setFormData({ ...formData, type: "expense", categoryId: "" })}
              >
                Pengeluaran
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Nominal</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Masukkan nominal"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Catatan (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Tambahkan catatan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !formData.categoryId || !formData.amount}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : transaction ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Transaksi"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
