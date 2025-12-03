"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendChart } from "@/components/reports/trend-chart"
import { CategoryPieChart } from "@/components/reports/category-pie-chart"
import { MonthlySummary } from "@/components/reports/monthly-summary"
import { ExportButton } from "@/components/reports/export-button"
import { DebtSummaryReport } from "@/components/reports/debt-summary-report"
import { DebtExportButton } from "@/components/reports/debt-export-button"
import { getCurrentMonth, getCurrentYear, getMonthName } from "@/lib/format"

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth().toString())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear().toString())
  const [activeTab, setActiveTab] = useState("transactions")

  const month = Number.parseInt(selectedMonth)
  const year = Number.parseInt(selectedYear)

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }))

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (getCurrentYear() - 2 + i).toString(),
    label: (getCurrentYear() - 2 + i).toString(),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Laporan Keuangan</h1>
          <p className="text-muted-foreground">Analisis dan visualisasi keuangan Anda</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
            <TabsTrigger value="debts">Utang Piutang</TabsTrigger>
          </TabsList>

          {activeTab === "transactions" ? (
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
              <ExportButton month={month} year={year} />
            </div>
          ) : (
            <DebtExportButton />
          )}
        </div>

        {/* Transaction Reports */}
        <TabsContent value="transactions" className="space-y-6 mt-6">
          {/* Monthly Summary */}
          <MonthlySummary month={month} year={year} />

          {/* Trend Chart */}
          <TrendChart year={year} />

          {/* Category Pie Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryPieChart month={month} year={year} type="expense" />
            <CategoryPieChart month={month} year={year} type="income" />
          </div>
        </TabsContent>

        {/* Debt Reports */}
        <TabsContent value="debts" className="mt-6">
          <DebtSummaryReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
