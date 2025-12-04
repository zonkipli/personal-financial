"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinance } from "@/contexts/finance-context";
import { usePrivacy } from "@/contexts/privacy-context";
import { formatCurrency, getMonthName } from "@/lib/format";
import { ChartContainer } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Tooltip,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface TrendChartProps {
  year: number;
}

export function TrendChart({ year }: TrendChartProps) {
  const { transactions } = useFinance();
  const { maskAmount, isVisible } = usePrivacy();

  // Calculate monthly data for the year
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    const income = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: getMonthName(month).substring(0, 3),
      monthFull: getMonthName(month),
      income,
      expense,
      balance: income - expense,
    };
  });

  const chartConfig = {
    income: {
      label: "Pemasukan",
      color: "#10b981",
    },
    expense: {
      label: "Pengeluaran",
      color: "#ef4444",
    },
    balance: {
      label: "Saldo",
      color: "#0ea5e9",
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 sm:p-3 shadow-lg text-xs sm:text-sm">
          <p className="font-medium mb-1 sm:mb-2">
            {payload[0]?.payload?.monthFull}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-1 sm:gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">
                {maskAmount(formatCurrency(entry.value))}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const yAxisFormatter = (value: number) => {
    if (!isVisible) return "***";
    return `${(value / 1000000).toFixed(0)}jt`;
  };

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
          Tren Keuangan {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <Tabs defaultValue="bar" className="space-y-3 sm:space-y-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="bar" className="text-xs sm:text-sm">
              Bar Chart
            </TabsTrigger>
            <TabsTrigger value="line" className="text-xs sm:text-sm">
              Line Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="h-[250px] sm:h-[350px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tickFormatter={yAxisFormatter}
                    tick={{ fontSize: 10 }}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar
                    dataKey="income"
                    name="Pemasukan"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    name="Pengeluaran"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="line" className="h-[250px] sm:h-[350px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 10, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tickFormatter={yAxisFormatter}
                    tick={{ fontSize: 10 }}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Pemasukan"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Pengeluaran"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Saldo"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
