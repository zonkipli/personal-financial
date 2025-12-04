"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useFinance } from "@/contexts/finance-context"
import { usePrivacy } from "@/contexts/privacy-context"
import { formatCurrency, getCurrentMonth, getCurrentYear, getMonthName } from "@/lib/format"
import { AlertTriangle, CheckCircle } from "lucide-react"

export function BudgetAlert() {
  const { getBudgetStatus } = useFinance()
  const { maskAmount } = usePrivacy()
  const month = getCurrentMonth()
  const year = getCurrentYear()

  const { budget, spent, remaining, percentage } = getBudgetStatus(month, year)

  if (budget === 0) return null

  const isOverBudget = remaining < 0
  const isNearLimit = percentage >= 80 && !isOverBudget

  return (
    <Alert
      variant={isOverBudget ? "destructive" : isNearLimit ? "default" : "default"}
      className="border-l-4 border-l-primary"
    >
      <div className="flex items-start gap-3">
        {isOverBudget ? (
          <AlertTriangle className="h-5 w-5 text-destructive" />
        ) : isNearLimit ? (
          <AlertTriangle className="h-5 w-5 text-warning" />
        ) : (
          <CheckCircle className="h-5 w-5 text-success" />
        )}
        <div className="flex-1 space-y-2">
          <AlertTitle>
            {isOverBudget ? "Anggaran Terlampaui!" : isNearLimit ? "Mendekati Batas Anggaran" : "Status Anggaran"}
          </AlertTitle>
          <AlertDescription>
            {isOverBudget
              ? `Pengeluaran Anda melebihi anggaran sebesar ${maskAmount(formatCurrency(Math.abs(remaining)))}`
              : `Sisa anggaran ${getMonthName(month)}: ${maskAmount(formatCurrency(remaining))} dari ${maskAmount(formatCurrency(budget))}`}
          </AlertDescription>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Terpakai: {maskAmount(formatCurrency(spent))}</span>
              <span>{Math.min(percentage, 100).toFixed(0)}%</span>
            </div>
            <Progress
              value={Math.min(percentage, 100)}
              className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-warning" : ""}`}
            />
          </div>
        </div>
      </div>
    </Alert>
  )
}
