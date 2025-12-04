"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { TransactionForm } from "./transaction-form";
import {
  formatCurrency,
  formatDate,
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from "@/lib/format";
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { Transaction } from "@/types";

export function TransactionList() {
  const { transactions, categories, deleteTransaction } = useFinance();
  const { maskAmount } = usePrivacy();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState(getCurrentMonth().toString());
  const [yearFilter, setYearFilter] = useState(getCurrentYear().toString());
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const filteredTransactions = transactions
    .filter((t) => {
      const date = new Date(t.date);
      const matchesMonth = date.getMonth() + 1 === Number.parseInt(monthFilter);
      const matchesYear = date.getFullYear() === Number.parseInt(yearFilter);
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || t.categoryId === categoryFilter;
      const matchesSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categories
          .find((c) => c.id === t.categoryId)
          ?.name.toLowerCase()
          .includes(searchQuery.toLowerCase());

      return (
        matchesMonth &&
        matchesYear &&
        matchesType &&
        matchesCategory &&
        matchesSearch
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || "Lainnya";

  const getCategoryColor = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.color || "#6b7280";

  const handleDelete = () => {
    if (deletingTransaction) {
      deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => getCurrentYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Card className="w-full max-w-full">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Daftar Transaksi</CardTitle>
            <TransactionForm />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 pt-4 sm:flex sm:flex-wrap sm:gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
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

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ArrowDownRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">Tidak ada transaksi</p>
              <p className="text-muted-foreground text-sm">
                Tambahkan transaksi untuk melihat data di sini
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 w-full"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                      style={{
                        backgroundColor: `${getCategoryColor(
                          transaction.categoryId
                        )}20`,
                      }}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-destructive" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[200px]">
                        {transaction.description ||
                          getCategoryName(transaction.categoryId)}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getCategoryName(transaction.categoryId)} •{" "}
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span
                      className={`font-semibold text-sm whitespace-nowrap ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {maskAmount(formatCurrency(transaction.amount))}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingTransaction(transaction)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingTransaction(transaction)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit */}
      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          trigger={<span className="hidden" />}
        />
      )}

      {/* Delete */}
      <AlertDialog
        open={!!deletingTransaction}
        onOpenChange={() => setDeletingTransaction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
