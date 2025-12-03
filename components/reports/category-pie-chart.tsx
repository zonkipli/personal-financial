"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinance } from "@/contexts/finance-context"
import { formatCurrency } from "@/lib/format"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { PieChartIcon } from "lucide-react"

interface CategoryPieChartProps {
  month: number
  year: number
  type: "income" | "expense"
}

export function CategoryPieChart({ month, year, type }: CategoryPieChartProps) {
  const { transactions, categories } = useFinance()

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() + 1 === month && date.getFullYear() === year && t.type === type
  })

  const categoryData = categories
    .filter((c) => c.type === type)
    .map((category) => {
      const amount = monthlyTransactions
        .filter((t) => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0)
      return {
        name: category.name,
        value: amount,
        color: category.color,
      }
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = categoryData.reduce((sum, c) => sum + c.value, 0)

  const chartConfig = categoryData.reduce(
    (acc, item) => {
      acc[item.name] = {
        label: item.name,
        color: item.color,
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>,
  )

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-medium">{data.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          {type === "income" ? "Komposisi Pemasukan" : "Komposisi Pengeluaran"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <PieChartIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Tidak ada data {type === "income" ? "pemasukan" : "pengeluaran"}</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Detail</p>
            {categoryData.map((item) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                    <span className="text-sm text-muted-foreground ml-2">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
