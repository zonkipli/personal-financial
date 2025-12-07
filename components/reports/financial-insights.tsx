"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinance } from "@/contexts/finance-context";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface FinancialInsightsProps {
  month: number;
  year: number;
}

export function FinancialInsights({ month, year }: FinancialInsightsProps) {
  const { transactions, budgets, categories, getMonthlyStats, savingsGoals, recurringTransactions } = useFinance();

  const currentStats = getMonthlyStats(month, year);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStats = getMonthlyStats(prevMonth, prevYear);

  const monthlyBudget = budgets.find(
    (b) => b.month === month && b.year === year && b.categoryId === null
  );

  const insights = [];

  const expenseChange = prevStats.expense > 0
    ? ((currentStats.expense - prevStats.expense) / prevStats.expense) * 100
    : 0;

  const incomeChange = prevStats.income > 0
    ? ((currentStats.income - prevStats.income) / prevStats.income) * 100
    : 0;

  if (expenseChange > 20) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Pengeluaran Meningkat Signifikan",
      description: `Pengeluaran Anda naik ${expenseChange.toFixed(1)}% dibanding bulan lalu. Pertimbangkan untuk meninjau kategori pengeluaran terbesar.`,
    });
  } else if (expenseChange < -10) {
    insights.push({
      type: "success",
      icon: CheckCircle2,
      title: "Pengeluaran Menurun",
      description: `Bagus! Pengeluaran Anda turun ${Math.abs(expenseChange).toFixed(1)}% dibanding bulan lalu.`,
    });
  }

  if (incomeChange > 10) {
    insights.push({
      type: "success",
      icon: TrendingUp,
      title: "Pemasukan Meningkat",
      description: `Pemasukan Anda naik ${incomeChange.toFixed(1)}% dibanding bulan lalu.`,
    });
  } else if (incomeChange < -10) {
    insights.push({
      type: "warning",
      icon: TrendingDown,
      title: "Pemasukan Menurun",
      description: `Pemasukan Anda turun ${Math.abs(incomeChange).toFixed(1)}% dibanding bulan lalu.`,
    });
  }

  if (monthlyBudget) {
    const budgetUsage = (currentStats.expense / monthlyBudget.amount) * 100;
    if (budgetUsage > 90) {
      insights.push({
        type: "danger",
        icon: AlertTriangle,
        title: "Budget Hampir Habis",
        description: `Anda telah menggunakan ${budgetUsage.toFixed(1)}% dari budget bulan ini.`,
      });
    } else if (budgetUsage < 50) {
      insights.push({
        type: "info",
        icon: Target,
        title: "Budget Terkontrol",
        description: `Anda baru menggunakan ${budgetUsage.toFixed(1)}% dari budget. Pertahankan!`,
      });
    }
  }

  if (currentStats.balance > 0) {
    const savingsRate = (currentStats.balance / currentStats.income) * 100;
    if (savingsRate > 20) {
      insights.push({
        type: "success",
        icon: CheckCircle2,
        title: "Tingkat Tabungan Bagus",
        description: `Anda menabung ${savingsRate.toFixed(1)}% dari pemasukan. Ini di atas rata-rata!`,
      });
    } else if (savingsRate > 0) {
      insights.push({
        type: "info",
        icon: Target,
        title: "Tingkatkan Tabungan",
        description: `Anda menabung ${savingsRate.toFixed(1)}% dari pemasukan. Coba tingkatkan ke minimal 20%.`,
      });
    }
  }

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  const categoryExpenses = categories
    .filter((c) => c.type === "expense")
    .map((cat) => ({
      ...cat,
      total: monthlyTransactions
        .filter((t) => t.categoryId === cat.id && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  if (categoryExpenses.length > 0) {
    const topCategory = categoryExpenses[0];
    const percentage = (topCategory.total / currentStats.expense) * 100;
    if (percentage > 40) {
      insights.push({
        type: "info",
        icon: Lightbulb,
        title: "Kategori Dominan",
        description: `${topCategory.name} menghabiskan ${percentage.toFixed(1)}% dari total pengeluaran (${formatCurrency(topCategory.total)}).`,
      });
    }
  }

  const avgDailyExpense = currentStats.expense / new Date(year, month, 0).getDate();
  const daysLeft = new Date(year, month, 0).getDate() - new Date().getDate();

  if (daysLeft > 0 && monthlyBudget) {
    const remainingBudget = monthlyBudget.amount - currentStats.expense;
    const recommendedDaily = remainingBudget / daysLeft;

    if (recommendedDaily < avgDailyExpense) {
      insights.push({
        type: "warning",
        icon: Calendar,
        title: "Perhatian Sisa Budget",
        description: `Untuk sisa ${daysLeft} hari, usahakan pengeluaran harian maksimal ${formatCurrency(recommendedDaily)} agar tidak melebihi budget.`,
      });
    }
  }

  const activeSavings = savingsGoals.filter((g) => !g.isCompleted);
  const nearDeadlineSavings = activeSavings.filter((g) => {
    if (!g.deadline) return false;
    const daysUntilDeadline = Math.ceil(
      (new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline > 0 && daysUntilDeadline <= 30;
  });

  if (nearDeadlineSavings.length > 0) {
    const savings = nearDeadlineSavings[0];
    const daysLeft = Math.ceil(
      (new Date(savings.deadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    const remaining = savings.targetAmount - savings.currentAmount;
    insights.push({
      type: "warning",
      icon: Target,
      title: "Target Tabungan Mendekat",
      description: `Target "${savings.name}" deadline dalam ${daysLeft} hari. Sisa ${formatCurrency(remaining)} lagi untuk mencapai target.`,
    });
  }

  const completedThisMonth = savingsGoals.filter((g) => {
    if (!g.isCompleted) return false;
    const date = new Date(g.createdAt);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  if (completedThisMonth.length > 0) {
    insights.push({
      type: "success",
      icon: CheckCircle2,
      title: "Target Tabungan Tercapai",
      description: `Selamat! Anda telah mencapai ${completedThisMonth.length} target tabungan bulan ini.`,
    });
  }

  const activeRecurring = recurringTransactions.filter((r) => r.isActive);
  const recurringIncome = activeRecurring
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);
  const recurringExpense = activeRecurring
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  if (recurringExpense > currentStats.income * 0.5) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Pengeluaran Rutin Tinggi",
      description: `Transaksi berulang Anda sebesar ${formatCurrency(recurringExpense)} mencapai lebih dari 50% pemasukan. Pertimbangkan untuk meninjau kembali.`,
    });
  }

  if (recurringIncome > 0 && recurringIncome < recurringExpense) {
    insights.push({
      type: "info",
      icon: TrendingDown,
      title: "Arus Kas Berulang Negatif",
      description: `Pengeluaran rutin (${formatCurrency(recurringExpense)}) lebih besar dari pemasukan rutin (${formatCurrency(recurringIncome)}).`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "info",
      icon: CheckCircle2,
      title: "Keuangan Stabil",
      description: "Kondisi keuangan Anda terlihat baik. Pertahankan pola pengelolaan keuangan ini!",
    });
  }

  const getVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default";
      case "warning":
        return "secondary";
      case "danger":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-success";
      case "warning":
        return "text-yellow-600 dark:text-yellow-500";
      case "danger":
        return "text-destructive";
      default:
        return "text-primary";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
          Insight Keuangan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`shrink-0 ${getColor(insight.type)}`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start gap-2">
                    <p className="font-medium text-sm sm:text-base flex-1">
                      {insight.title}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
