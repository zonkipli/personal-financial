"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFinance } from "@/contexts/finance-context";
import type { RecurringTransaction } from "@/types";

interface RecurringTransactionFormProps {
  recurring?: RecurringTransaction | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RecurringTransaction>) => Promise<void>;
}

export function RecurringTransactionForm({
  recurring,
  open,
  onClose,
  onSubmit,
}: RecurringTransactionFormProps) {
  const { categories } = useFinance();
  const [formData, setFormData] = useState({
    categoryId: "",
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  useEffect(() => {
    if (recurring) {
      setFormData({
        categoryId: recurring.categoryId,
        type: recurring.type,
        amount: recurring.amount.toString(),
        description: recurring.description || "",
        frequency: recurring.frequency,
        startDate: recurring.startDate,
        endDate: recurring.endDate || "",
      });
    } else {
      setFormData({
        categoryId: "",
        type: "expense",
        amount: "",
        description: "",
        frequency: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
    }
  }, [recurring, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      categoryId: formData.categoryId,
      type: formData.type,
      amount: parseFloat(formData.amount) || 0,
      description: formData.description,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
    });
    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recurring ? "Edit" : "Tambah"} Transaksi Berulang
          </DialogTitle>
          <DialogDescription>
            Transaksi yang akan diproses secara otomatis
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipe</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "income" | "expense") =>
                setFormData({ ...formData, type: value, categoryId: "" })
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="categoryId">Kategori</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g., Gaji Bulanan, Tagihan Listrik"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="frequency">Frekuensi</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") =>
                setFormData({ ...formData, frequency: value })
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">Sampai (Opsional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {recurring ? "Perbarui" : "Tambah"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
