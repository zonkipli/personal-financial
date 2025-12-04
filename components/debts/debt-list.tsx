"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { DebtForm } from "./debt-form";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Debt } from "@/types";
import {
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
} from "lucide-react";

interface DebtListProps {
  filter: "all" | "receivable" | "payable";
  showPaid: boolean;
}

export function DebtList({ filter, showPaid }: DebtListProps) {
  const { debts, deleteDebt, markDebtAsPaid } = useFinance();
  const { maskAmount } = usePrivacy();

  const filteredDebts = debts
    .filter((debt) => {
      if (filter !== "all" && debt.type !== filter) return false;
      if (!showPaid && debt.isPaid) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
      if (a.dueDate && b.dueDate)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const isOverdue = (debt: Debt) => {
    if (!debt.dueDate || debt.isPaid) return false;
    return new Date(debt.dueDate) < new Date();
  };

  if (filteredDebts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Belum ada data utang/piutang</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 w-full max-w-full overflow-x-hidden">
      {filteredDebts.map((debt) => (
        <Card
          key={debt.id}
          className={`${debt.isPaid ? "opacity-60" : ""} ${
            isOverdue(debt) ? "border-destructive" : ""
          }`}
        >
          <CardContent className="p-4 w-full">
            {/* WRAP FIXED */}
            <div className="flex flex-wrap items-start justify-between gap-4 w-full">
              {/* LEFT SIDE */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                  <span className="font-semibold truncate max-w-[180px] sm:max-w-full">
                    {debt.personName}
                  </span>

                  <Badge
                    variant={
                      debt.type === "receivable" ? "default" : "destructive"
                    }
                  >
                    {debt.type === "receivable" ? "Piutang" : "Utang"}
                  </Badge>

                  {debt.isPaid && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" /> Lunas
                    </Badge>
                  )}

                  {isOverdue(debt) && (
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" /> Jatuh Tempo
                    </Badge>
                  )}
                </div>

                {debt.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2 break-words">
                    {debt.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Dibuat: {formatDate(debt.createdAt)}</span>

                  {debt.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Jatuh tempo: {formatDate(debt.dueDate)}
                    </span>
                  )}

                  {debt.paidDate && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Lunas: {formatDate(debt.paidDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE — FIXED FOR MOBILE */}
              <div className="shrink-0 text-right flex flex-col items-end min-w-[100px]">
                <p
                  className={`text-lg font-bold whitespace-nowrap ${
                    debt.type === "receivable"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {debt.type === "receivable" ? "+" : "-"}
                  {maskAmount(formatCurrency(debt.amount))}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  {!debt.isPaid && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1 h-7 w-7"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tandai Lunas?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {debt.type === "receivable"
                              ? `${debt.personName} sudah membayar ${maskAmount(
                                  formatCurrency(debt.amount)
                                )}?`
                              : `Anda sudah membayar ${maskAmount(
                                  formatCurrency(debt.amount)
                                )} ke ${debt.personName}?`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => markDebtAsPaid(debt.id)}
                          >
                            Ya, Tandai Lunas
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <DebtForm
                    debt={debt}
                    trigger={
                      <Button variant="ghost" size="sm" className="p-1 h-7 w-7">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Data{" "}
                          {debt.type === "receivable" ? "piutang" : "utang"}{" "}
                          dari {debt.personName} sebesar{" "}
                          {maskAmount(formatCurrency(debt.amount))} akan dihapus
                          permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteDebt(debt.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
