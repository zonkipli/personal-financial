"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { formatCurrency } from "@/lib/format";
import { ChartContainer } from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { PieChartIcon } from "lucide-react";

interface CategoryPieChartProps {
  month: number;
  year: number;
  type: "income" | "expense";
}

export function CategoryPieChart({ month, year, type }: CategoryPieChartProps) {
  const { transactions, categories } = useFinance();
  const { maskAmount } = usePrivacy();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return (
      date.getMonth() + 1 === month &&
      date.getFullYear() === year &&
      t.type === type
    );
  });

  const categoryData = categories
    .filter((c) => c.type === type)
    .map((category) => {
      const amount = monthlyTransactions
        .filter((t) => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: category.name,
        value: amount,
        color: category.color,
      };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = categoryData.reduce((sum, c) => sum + c.value, 0);

  const chartConfig = categoryData.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.color,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage =
        total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="rounded-lg border bg-background p-2 sm:p-3 shadow-lg text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <div
              className="h-2 w-2 sm:h-3 sm:w-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium">{data.name}</span>
          </div>
          <p className="text-muted-foreground">
            {maskAmount(formatCurrency(data.value))} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
        {payload?.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <div
              className="h-2 w-2 sm:h-3 sm:w-3 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          {type === "income" ? "Komposisi Pemasukan" : "Komposisi Pengeluaran"}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
              <PieChartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Tidak ada data {type === "income" ? "pemasukan" : "pengeluaran"}
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[220px] sm:h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Category breakdown list */}
        {categoryData.length > 0 && (
          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Detail</p>
            {categoryData.map((item) => {
              const percentage =
                total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-2 w-2 sm:h-3 sm:w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs sm:text-sm truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-medium text-xs sm:text-sm">
                      {maskAmount(formatCurrency(item.value))}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1 sm:ml-2">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
