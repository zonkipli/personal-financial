"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Repeat, Calendar, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/format";
import { usePrivacy } from "@/contexts/privacy-context";
import { useFinance } from "@/contexts/finance-context";
import type { RecurringTransaction } from "@/types";

interface RecurringTransactionItemProps {
  recurring: RecurringTransaction;
  onEdit: (recurring: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
}

export function RecurringTransactionItem({
  recurring,
  onEdit,
  onDelete,
  onToggleActive,
}: RecurringTransactionItemProps) {
  const { maskAmount } = usePrivacy();
  const { categories } = useFinance();

  const category = categories.find((c) => c.id === recurring.categoryId);
  const frequencyText = {
    daily: "Harian",
    weekly: "Mingguan",
    monthly: "Bulanan",
    yearly: "Tahunan",
  }[recurring.frequency];

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`rounded-lg p-1.5 sm:p-2 shrink-0 ${
              recurring.type === "income" ? "bg-success/10" : "bg-destructive/10"
            }`}
          >
            {recurring.type === "income" ? (
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base line-clamp-1">
                  {recurring.description || category?.name || "Transaksi"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {category?.name}
                </p>
              </div>
              <p
                className={`font-semibold text-sm sm:text-base shrink-0 ${
                  recurring.type === "income" ? "text-success" : "text-destructive"
                }`}
              >
                {maskAmount(formatCurrency(recurring.amount))}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Repeat className="h-3 w-3 mr-1" />
                {frequencyText}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Mulai: {new Date(recurring.startDate).toLocaleDateString("id-ID")}
              </Badge>
              {recurring.endDate && (
                <Badge variant="secondary" className="text-xs">
                  Sampai: {new Date(recurring.endDate).toLocaleDateString("id-ID")}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={recurring.isActive}
                  onCheckedChange={(checked) => onToggleActive(recurring.id, checked)}
                />
                <span className="text-xs text-muted-foreground">
                  {recurring.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs sm:text-sm h-7 sm:h-8"
                  onClick={() => onEdit(recurring)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs sm:text-sm h-7 sm:h-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onDelete(recurring.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
