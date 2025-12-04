"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinance } from "@/contexts/finance-context"
import { usePrivacy } from "@/contexts/privacy-context"
import { formatCurrency, getMonthName } from "@/lib/format"
import { ChartContainer } from "@/components/ui/chart"
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
} from "recharts"
import { BarChart3 } from "lucide-react"

interface TrendChartProps {
  year: number
}

export function TrendChart({ year }: TrendChartProps) {
  const { transactions } = useFinance()
  const { maskAmount, isVisible } = usePrivacy()

  // Calculate monthly data for the year
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() + 1 === month && date.getFullYear() === year
    })

    const income = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expense = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return {
      month: getMonthName(month).substring(0, 3),
      monthFull: getMonthName(month),
      income,
      expense,
      balance: income - expense,
    }
  })

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
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium mb-2">{payload[0]?.payload?.monthFull}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{maskAmount(formatCurrency(entry.value))}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const yAxisFormatter = (value: number) => {
    if (!isVisible) return "***"
    return `${(value / 1000000).toFixed(0)}jt`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tren Keuangan {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="line">Line Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="h-[350px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="line" className="h-[350px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Pemasukan"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Pengeluaran"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Saldo"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#0ea5e9", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
