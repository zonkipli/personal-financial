"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { Target, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SavingsSummaryReport() {
  const { savingsGoals } = useFinance();
  const { maskAmount } = usePrivacy();

  const activeSavings = savingsGoals.filter((g) => !g.isCompleted);
  const completedSavings = savingsGoals.filter((g) => g.isCompleted);

  const totalTargetAmount = activeSavings.reduce(
    (sum, g) => sum + g.targetAmount,
    0
  );
  const totalCurrentAmount = activeSavings.reduce(
    (sum, g) => sum + g.currentAmount,
    0
  );
  const totalProgress =
    totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  const sortedActiveSavings = [...activeSavings].sort((a, b) => {
    const progressA = (a.currentAmount / a.targetAmount) * 100;
    const progressB = (b.currentAmount / b.targetAmount) * 100;
    return progressB - progressA;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Target Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{activeSavings.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Target Tercapai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold text-success">
                {completedSavings.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {maskAmount(formatCurrency(totalTargetAmount))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Terkumpul
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {maskAmount(formatCurrency(totalCurrentAmount))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      {activeSavings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Progress Keseluruhan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Total Progress dari Semua Target
                </span>
                <span className="font-semibold">{totalProgress.toFixed(1)}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{maskAmount(formatCurrency(totalCurrentAmount))}</span>
                <span>{maskAmount(formatCurrency(totalTargetAmount))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Savings Goals Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Detail Target Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedActiveSavings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Belum ada target tabungan aktif</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedActiveSavings.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const remaining = goal.targetAmount - goal.currentAmount;
                const daysLeft = goal.deadline
                  ? Math.ceil(
                      (new Date(goal.deadline).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;

                return (
                  <div
                    key={goal.id}
                    className="space-y-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{goal.name}</h4>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={progress >= 75 ? "default" : "secondary"}
                      >
                        {progress.toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{maskAmount(formatCurrency(goal.currentAmount))}</span>
                        <span>{maskAmount(formatCurrency(goal.targetAmount))}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-warning" />
                        <span className="text-muted-foreground">Sisa:</span>
                        <span className="font-medium">
                          {maskAmount(formatCurrency(remaining))}
                        </span>
                      </div>
                      {goal.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-info" />
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">
                            {formatDate(goal.deadline)}
                          </span>
                          {daysLeft !== null && (
                            <span
                              className={`text-xs ${
                                daysLeft < 30
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            >
                              ({daysLeft} hari)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Savings Goals */}
      {completedSavings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Target Tercapai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedSavings.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-success/5"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{goal.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {maskAmount(formatCurrency(goal.targetAmount))}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Tercapai
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
