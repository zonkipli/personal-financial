"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFinance } from "@/contexts/finance-context"
import { usePrivacy } from "@/contexts/privacy-context"
import { BudgetForm } from "./budget-form"
import { formatCurrency, getCurrentMonth, getCurrentYear, getMonthName } from "@/lib/format"
import { PiggyBank, MoreVertical, Edit, Trash2, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react"
import type { Budget } from "@/types"

export function BudgetOverview() {
  const { budgets, transactions, categories, getMonthlyStats, deleteBudget } = useFinance()
  const { maskAmount } = usePrivacy()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth().toString())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear().toString())
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)

  const month = Number.parseInt(selectedMonth)
  const year = Number.parseInt(selectedYear)

  const currentBudget = budgets.find((b) => b.month === month && b.year === year && b.categoryId === null)

  const { expense: totalSpent } = getMonthlyStats(month, year)
  const budgetAmount = currentBudget?.amount || 0
  const remaining = budgetAmount - totalSpent
  const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0

  const isOverBudget = remaining < 0
  const isNearLimit = percentage >= 80 && !isOverBudget

  // Get expense breakdown by category
  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() + 1 === month && date.getFullYear() === year && t.type === "expense"
  })

  const categoryBreakdown = categories
    .filter((c) => c.type === "expense")
    .map((category) => {
      const amount = monthlyTransactions
        .filter((t) => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0)
      return {
        ...category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const handleDelete = () => {
    if (deletingBudget) {
      deleteBudget(deletingBudget.id)
      setDeletingBudget(null)
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }))

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (getCurrentYear() - 2 + i).toString(),
    label: (getCurrentYear() - 2 + i).toString(),
  }))

  return (
    <>
      <div className="space-y-6">
        {/* Budget Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Anggaran Bulanan
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[130px]">
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
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.value} value={y.value}>
                        {y.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentBudget ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingBudget(currentBudget)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeletingBudget(currentBudget)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <BudgetForm />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {budgetAmount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <PiggyBank className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">Belum ada anggaran</p>
                <p className="text-muted-foreground mb-4">
                  Atur anggaran untuk {getMonthName(month)} {year}
                </p>
                <BudgetForm />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status Alert */}
                <div
                  className={`flex items-center gap-3 rounded-lg p-4 ${
                    isOverBudget ? "bg-destructive/10" : isNearLimit ? "bg-warning/10" : "bg-success/10"
                  }`}
                >
                  {isOverBudget ? (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  ) : isNearLimit ? (
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {isOverBudget
                        ? "Anggaran Terlampaui!"
                        : isNearLimit
                          ? "Mendekati Batas Anggaran"
                          : "Anggaran Dalam Batas Aman"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isOverBudget
                        ? `Pengeluaran Anda melebihi anggaran sebesar ${maskAmount(formatCurrency(Math.abs(remaining)))}`
                        : `Sisa anggaran: ${maskAmount(formatCurrency(remaining))}`}
                    </p>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Terpakai</p>
                      <p className="text-2xl font-bold">{maskAmount(formatCurrency(totalSpent))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Anggaran</p>
                      <p className="text-2xl font-bold">{maskAmount(formatCurrency(budgetAmount))}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={`h-3 ${
                        isOverBudget
                          ? "[&>div]:bg-destructive"
                          : isNearLimit
                            ? "[&>div]:bg-warning"
                            : "[&>div]:bg-success"
                      }`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{percentage.toFixed(1)}% terpakai</span>
                      <span>Sisa: {maskAmount(formatCurrency(Math.max(remaining, 0)))}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Breakdown Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryBreakdown.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{maskAmount(formatCurrency(category.amount))}</span>
                        <span className="text-sm text-muted-foreground ml-2">({category.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <Progress
                      value={category.percentage}
                      className="h-2"
                      style={{ "--progress-color": category.color } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {editingBudget && (
        <BudgetForm
          budget={editingBudget}
          onClose={() => setEditingBudget(null)}
          trigger={<span className="hidden" />}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingBudget} onOpenChange={() => setDeletingBudget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Anggaran untuk {getMonthName(month)} {year} akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
