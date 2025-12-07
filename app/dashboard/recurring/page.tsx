"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Repeat } from "lucide-react";
import { useFinance } from "@/contexts/finance-context";
import { RecurringTransactionItem } from "@/components/recurring/recurring-transaction-item";
import { RecurringTransactionForm } from "@/components/recurring/recurring-transaction-form";
import { formatCurrency } from "@/lib/format";
import type { RecurringTransaction } from "@/types";

export default function RecurringPage() {
  const {
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
  } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | null>(null);

  const handleSubmit = async (data: Partial<RecurringTransaction>) => {
    if (selectedRecurring) {
      await updateRecurringTransaction(selectedRecurring.id, data);
    } else {
      await addRecurringTransaction(data as Omit<RecurringTransaction, "id" | "userId" | "createdAt">);
    }
  };

  const handleEdit = (recurring: RecurringTransaction) => {
    setSelectedRecurring(recurring);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedRecurring(null);
    setFormOpen(true);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateRecurringTransaction(id, { isActive });
  };

  const activeRecurring = recurringTransactions.filter((r) => r.isActive);
  const inactiveRecurring = recurringTransactions.filter((r) => !r.isActive);

  const monthlyIncomeEstimate = activeRecurring
    .filter((r) => r.type === "income")
    .reduce((sum, r) => {
      const multiplier = r.frequency === "monthly" ? 1 : r.frequency === "yearly" ? 1 / 12 : r.frequency === "weekly" ? 4.33 : 30;
      return sum + r.amount * multiplier;
    }, 0);

  const monthlyExpenseEstimate = activeRecurring
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => {
      const multiplier = r.frequency === "monthly" ? 1 : r.frequency === "yearly" ? 1 / 12 : r.frequency === "weekly" ? 4.33 : 30;
      return sum + r.amount * multiplier;
    }, 0);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
            Transaksi Berulang
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Kelola transaksi yang terjadi secara rutin
          </p>
        </div>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {recurringTransactions.length > 0 && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="p-3 sm:p-4 rounded-lg border bg-card">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              Estimasi Pemasukan/Bulan
            </p>
            <p className="font-bold text-base sm:text-lg text-success">
              {formatCurrency(monthlyIncomeEstimate)}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg border bg-card">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              Estimasi Pengeluaran/Bulan
            </p>
            <p className="font-bold text-base sm:text-lg text-destructive">
              {formatCurrency(monthlyExpenseEstimate)}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg border bg-card">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              Total Transaksi Aktif
            </p>
            <p className="font-bold text-base sm:text-lg">
              {activeRecurring.length}
            </p>
          </div>
        </div>
      )}

      {activeRecurring.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Transaksi Aktif ({activeRecurring.length})
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {activeRecurring.map((recurring) => (
              <RecurringTransactionItem
                key={recurring.id}
                recurring={recurring}
                onEdit={handleEdit}
                onDelete={deleteRecurringTransaction}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </div>
      )}

      {inactiveRecurring.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Transaksi Nonaktif ({inactiveRecurring.length})
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {inactiveRecurring.map((recurring) => (
              <RecurringTransactionItem
                key={recurring.id}
                recurring={recurring}
                onEdit={handleEdit}
                onDelete={deleteRecurringTransaction}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </div>
      )}

      {recurringTransactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="rounded-full bg-muted p-4 sm:p-6 mb-4">
            <Repeat className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Belum Ada Transaksi Berulang
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Tambahkan transaksi yang terjadi secara rutin seperti gaji bulanan,
            tagihan listrik, atau langganan streaming
          </p>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Transaksi Pertama
          </Button>
        </div>
      )}

      <RecurringTransactionForm
        recurring={selectedRecurring}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedRecurring(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
