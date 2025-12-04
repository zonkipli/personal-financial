"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useFinance } from "@/contexts/finance-context";
import type { Wallet, WalletType } from "@/types";
import {
  Plus,
  Loader2,
  WalletIcon,
  Building2,
  Smartphone,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";

const WALLET_TYPES: {
  value: WalletType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "cash",
    label: "Dompet Tunai",
    icon: <WalletIcon className="h-4 w-4" />,
  },
  {
    value: "bank",
    label: "Rekening Bank",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    value: "e-wallet",
    label: "E-Wallet",
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    value: "investment",
    label: "Investasi",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    value: "other",
    label: "Lainnya",
    icon: <MoreHorizontal className="h-4 w-4" />,
  },
];

const WALLET_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

interface WalletFormProps {
  wallet?: Wallet;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export function WalletForm({ wallet, onClose, trigger }: WalletFormProps) {
  const { addWallet, updateWallet } = useFinance();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: wallet?.name || "",
    type: wallet?.type || ("cash" as WalletType),
    balance: wallet?.balance?.toString() || "0",
    color: wallet?.color || WALLET_COLORS[0],
    isDefault: wallet?.isDefault || false,
  });

  useEffect(() => {
    if (wallet) {
      setFormData({
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance.toString(),
        color: wallet.color,
        isDefault: wallet.isDefault,
      });
    }
  }, [wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      name: formData.name,
      type: formData.type,
      balance: Number.parseFloat(formData.balance),
      icon:
        WALLET_TYPES.find((t) => t.value === formData.type)?.value || "Wallet",
      color: formData.color,
      isDefault: formData.isDefault,
    };

    if (wallet) {
      await updateWallet(wallet.id, data);
    } else {
      await addWallet(data);
    }

    setIsLoading(false);
    setOpen(false);
    setFormData({
      name: "",
      type: "cash",
      balance: "0",
      color: WALLET_COLORS[0],
      isDefault: false,
    });
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Dompet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {wallet ? "Edit Dompet" : "Tambah Dompet Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Dompet</Label>
            <Input
              id="name"
              placeholder="Contoh: BCA, Gopay, Dompet Utama"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe Dompet</Label>
            <Select
              value={formData.type}
              onValueChange={(value: WalletType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe dompet" />
              </SelectTrigger>
              <SelectContent>
                {WALLET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Saldo Awal</Label>
            <Input
              id="balance"
              type="number"
              placeholder="Masukkan saldo awal"
              value={formData.balance}
              onChange={(e) =>
                setFormData({ ...formData, balance: e.target.value })
              }
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex flex-wrap gap-2">
              {WALLET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isDefault">Jadikan Default</Label>
              <p className="text-xs text-muted-foreground">
                Dompet ini akan dipilih otomatis saat transaksi baru
              </p>
            </div>
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked })
              }
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !formData.name}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : wallet ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Dompet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
