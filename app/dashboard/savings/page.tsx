"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { useFinance } from "@/contexts/finance-context";
import { SavingsGoalCard } from "@/components/savings/savings-goal-card";
import { SavingsGoalForm } from "@/components/savings/savings-goal-form";
import { AddProgressDialog } from "@/components/savings/add-progress-dialog";
import { formatCurrency } from "@/lib/format";
import type { SavingsGoal } from "@/types";

export default function SavingsPage() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const handleSubmit = async (data: Partial<SavingsGoal>) => {
    if (selectedGoal) {
      await updateSavingsGoal(selectedGoal.id, data);
    } else {
      await addSavingsGoal(data as Omit<SavingsGoal, "id" | "userId" | "createdAt">);
    }
  };

  const handleAddProgress = async (amount: number) => {
    if (selectedGoal) {
      const newCurrent = selectedGoal.currentAmount + amount;
      const isCompleted = newCurrent >= selectedGoal.targetAmount;
      await updateSavingsGoal(selectedGoal.id, {
        currentAmount: newCurrent,
        isCompleted,
      });
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedGoal(null);
    setFormOpen(true);
  };

  const handleShowProgress = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setProgressOpen(true);
  };

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  const activeGoals = savingsGoals.filter((g) => !g.isCompleted);
  const completedGoals = savingsGoals.filter((g) => g.isCompleted);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
            Target Tabungan
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Kelola dan pantau target tabungan Anda
          </p>
        </div>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Target
        </Button>
      </div>

      {savingsGoals.length > 0 && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="p-3 sm:p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Target
              </p>
            </div>
            <p className="font-bold text-base sm:text-lg">
              {formatCurrency(totalTarget)}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg border bg-card">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              Terkumpul
            </p>
            <p className="font-bold text-base sm:text-lg text-success">
              {formatCurrency(totalCurrent)}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg border bg-card">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              Progress Total
            </p>
            <p className="font-bold text-base sm:text-lg">
              {totalProgress.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Target Aktif ({activeGoals.length})
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={deleteSavingsGoal}
                onAddProgress={handleShowProgress}
              />
            ))}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Target Selesai ({completedGoals.length})
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={deleteSavingsGoal}
                onAddProgress={handleShowProgress}
              />
            ))}
          </div>
        </div>
      )}

      {savingsGoals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="rounded-full bg-muted p-4 sm:p-6 mb-4">
            <Target className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Belum Ada Target Tabungan
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Mulai rencanakan masa depan dengan membuat target tabungan untuk hal-hal
            yang ingin Anda capai
          </p>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Target Pertama
          </Button>
        </div>
      )}

      <SavingsGoalForm
        goal={selectedGoal}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedGoal(null);
        }}
        onSubmit={handleSubmit}
      />

      <AddProgressDialog
        goal={selectedGoal}
        open={progressOpen}
        onClose={() => {
          setProgressOpen(false);
          setSelectedGoal(null);
        }}
        onSubmit={handleAddProgress}
      />
    </div>
  );
}
