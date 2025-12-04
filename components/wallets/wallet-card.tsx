"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { formatCurrency } from "@/lib/format";
import type { Wallet } from "@/types";
import { WalletForm } from "./wallet-form";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  WalletIcon,
  Building2,
  Smartphone,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";

const WALLET_ICONS: Record<string, React.ReactNode> = {
  cash: <WalletIcon className="h-5 w-5" />,
  bank: <Building2 className="h-5 w-5" />,
  "e-wallet": <Smartphone className="h-5 w-5" />,
  investment: <TrendingUp className="h-5 w-5" />,
  other: <MoreHorizontal className="h-5 w-5" />,
};

const WALLET_TYPE_LABELS: Record<string, string> = {
  cash: "Tunai",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  investment: "Investasi",
  other: "Lainnya",
};

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const { deleteWallet, updateWallet } = useFinance();
  const { isAmountHidden } = usePrivacy();

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus dompet ini?")) {
      await deleteWallet(wallet.id);
    }
  };

  const handleSetDefault = async () => {
    await updateWallet(wallet.id, { isDefault: true });
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-2" style={{ backgroundColor: wallet.color }} />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: wallet.color }}
          >
            {WALLET_ICONS[wallet.type]}
          </div>
          <div>
            <h3 className="font-semibold leading-none tracking-tight">
              {wallet.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {WALLET_TYPE_LABELS[wallet.type]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {wallet.isDefault && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Default
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <WalletForm
                wallet={wallet}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              {!wallet.isDefault && (
                <DropdownMenuItem onClick={handleSetDefault}>
                  <Star className="mr-2 h-4 w-4" />
                  Jadikan Default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Saldo</p>
          <p
            className="text-xl sm:text-2xl font-bold"
            style={{ color: wallet.color }}
          >
            {isAmountHidden ? "••••••••" : formatCurrency(wallet.balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
