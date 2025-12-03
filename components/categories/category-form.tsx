"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useFinance } from "@/contexts/finance-context"
import type { Category } from "@/types"
import { Plus, Loader2 } from "lucide-react"

const COLORS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
]

const ICONS = [
  "Wallet",
  "Briefcase",
  "TrendingUp",
  "Utensils",
  "Car",
  "ShoppingBag",
  "Receipt",
  "Gamepad2",
  "Home",
  "Heart",
  "Gift",
  "Plane",
  "Book",
  "Music",
  "Coffee",
]

interface CategoryFormProps {
  category?: Category
  onClose?: () => void
  trigger?: React.ReactNode
}

export function CategoryForm({ category, onClose, trigger }: CategoryFormProps) {
  const { addCategory, updateCategory } = useFinance()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: category?.name || "",
    type: category?.type || ("expense" as "income" | "expense"),
    color: category?.color || COLORS[0],
    icon: category?.icon || ICONS[0],
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
      })
    }
  }, [category])

  useEffect(() => {
    if (category && !open) {
      setOpen(true)
    }
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (category) {
      updateCategory(category.id, formData)
    } else {
      addCategory(formData)
    }

    setIsLoading(false)
    setOpen(false)
    setFormData({
      name: "",
      type: "expense",
      color: COLORS[0],
      icon: ICONS[0],
    })
    onClose?.()
  }

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
            Tambah Kategori
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kategori</Label>
            <Input
              id="name"
              placeholder="Masukkan nama kategori"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipe</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.type === "income" ? "default" : "outline"}
                className={formData.type === "income" ? "bg-success hover:bg-success/90" : ""}
                onClick={() => setFormData({ ...formData, type: "income" })}
              >
                Pemasukan
              </Button>
              <Button
                type="button"
                variant={formData.type === "expense" ? "default" : "outline"}
                className={formData.type === "expense" ? "bg-destructive hover:bg-destructive/90" : ""}
                onClick={() => setFormData({ ...formData, type: "expense" })}
              >
                Pengeluaran
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    formData.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    {icon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" className="flex-1" disabled={isLoading || !formData.name}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : category ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Kategori"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
