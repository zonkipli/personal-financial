"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import type { SavingsGoal } from "@/types";

interface AddProgressDialogProps {
  goal: SavingsGoal | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}

export function AddProgressDialog({
  goal,
  open,
  onClose,
  onSubmit,
}: AddProgressDialogProps) {
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const addAmount = parseFloat(amount) || 0;
    if (addAmount > 0) {
      await onSubmit(addAmount);
      setAmount("");
      onClose();
    }
  };

  if (!goal) return null;

  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah Progress</DialogTitle>
          <DialogDescription>{goal.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Terkumpul</p>
              <p className="font-semibold">{formatCurrency(goal.currentAmount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-semibold">{formatCurrency(goal.targetAmount)}</p>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Sisa</p>
            <p className="font-bold text-lg">{formatCurrency(remaining)}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Jumlah Tambahan (Rp)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit">Tambah</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
