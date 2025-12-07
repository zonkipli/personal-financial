"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { SavingsGoal } from "@/types";

interface SavingsGoalFormProps {
  goal?: SavingsGoal | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SavingsGoal>) => Promise<void>;
}

export function SavingsGoalForm({
  goal,
  open,
  onClose,
  onSubmit,
}: SavingsGoalFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    description: "",
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline || "",
        description: goal.description || "",
      });
    } else {
      setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        deadline: "",
        description: "",
      });
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline || null,
      description: formData.description,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit" : "Tambah"} Target Tabungan</DialogTitle>
          <DialogDescription>
            {goal ? "Perbarui" : "Buat"} target tabungan Anda
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Target</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Laptop Baru"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetAmount">Target (Rp)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="currentAmount">Terkumpul (Rp)</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, currentAmount: e.target.value })
                }
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="deadline">Batas Waktu (Opsional)</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {goal ? "Perbarui" : "Tambah"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
