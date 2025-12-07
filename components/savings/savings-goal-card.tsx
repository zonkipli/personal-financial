"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Plus, Check, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { usePrivacy } from "@/contexts/privacy-context";
import type { SavingsGoal } from "@/types";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onAddProgress: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
  onAddProgress,
}: SavingsGoalCardProps) {
  const { maskAmount } = usePrivacy();

  const progress = goal.targetAmount > 0
    ? (goal.currentAmount / goal.targetAmount) * 100
    : 0;

  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.isCompleted || progress >= 100;

  const daysLeft = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Card className={isCompleted ? "border-success bg-success/5" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`rounded-lg p-1.5 sm:p-2 ${isCompleted ? "bg-success/10" : "bg-primary/10"}`}>
              {isCompleted ? (
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
              ) : (
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base line-clamp-1">
                {goal.name}
              </CardTitle>
              {goal.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {goal.description}
                </p>
              )}
            </div>
          </div>
          {isCompleted && (
            <Badge variant="default" className="bg-success text-xs shrink-0">
              Selesai
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Terkumpul</p>
            <p className="font-semibold text-sm sm:text-base">
              {maskAmount(formatCurrency(goal.currentAmount))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="font-semibold text-sm sm:text-base">
              {maskAmount(formatCurrency(goal.targetAmount))}
            </p>
          </div>
        </div>

        {!isCompleted && remaining > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Sisa</span>
              <span className="font-medium text-primary">
                {maskAmount(formatCurrency(remaining))}
              </span>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center gap-1 sm:gap-2 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {daysLeft > 0
                    ? `${daysLeft} hari lagi`
                    : daysLeft === 0
                    ? "Hari ini"
                    : `Terlambat ${Math.abs(daysLeft)} hari`}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!isCompleted && (
            <Button
              size="sm"
              className="flex-1 text-xs sm:text-sm"
              onClick={() => onAddProgress(goal)}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Tambah
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-xs sm:text-sm"
            onClick={() => onEdit(goal)}
          >
            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs sm:text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
