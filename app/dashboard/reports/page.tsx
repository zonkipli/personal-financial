"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendChart } from "@/components/reports/trend-chart";
import { CategoryPieChart } from "@/components/reports/category-pie-chart";
import { MonthlySummary } from "@/components/reports/monthly-summary";
import { FinancialInsights } from "@/components/reports/financial-insights";
import { ExportButton } from "@/components/reports/export-button";
import { DebtSummaryReport } from "@/components/reports/debt-summary-report";
import { DebtExportButton } from "@/components/reports/debt-export-button";
import { SavingsSummaryReport } from "@/components/reports/savings-summary-report";
import { RecurringSummaryReport } from "@/components/reports/recurring-summary-report";
import { getCurrentMonth, getCurrentYear, getMonthName } from "@/lib/format";

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    getCurrentMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(getCurrentYear().toString());
  const [activeTab, setActiveTab] = useState("transactions");

  const month = Number.parseInt(selectedMonth);
  const year = Number.parseInt(selectedYear);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (getCurrentYear() - 2 + i).toString(),
    label: (getCurrentYear() - 2 + i).toString(),
  }));

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
            Laporan Keuangan
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Analisis dan visualisasi keuangan Anda
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-3 sm:gap-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 sm:flex">
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">
              Transaksi
            </TabsTrigger>
            <TabsTrigger value="debts" className="text-xs sm:text-sm">
              Utang Piutang
            </TabsTrigger>
            <TabsTrigger value="savings" className="text-xs sm:text-sm">
              Target Tabungan
            </TabsTrigger>
            <TabsTrigger value="recurring" className="text-xs sm:text-sm">
              Transaksi Berulang
            </TabsTrigger>
          </TabsList>

          {activeTab === "transactions" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-[130px]">
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
                  <SelectTrigger className="w-full sm:w-[100px]">
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
              </div>
              <div className="w-full sm:w-auto">
                <ExportButton month={month} year={year} />
              </div>
            </div>
          ) : activeTab === "debts" ? (
            <div className="w-full sm:w-auto">
              <DebtExportButton />
            </div>
          ) : null}
        </div>

        {/* Transaction Reports */}
        <TabsContent
          value="transactions"
          className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
        >
          {/* Monthly Summary */}
          <MonthlySummary month={month} year={year} />

          {/* Financial Insights */}
          <FinancialInsights month={month} year={year} />

          {/* Trend Chart */}
          <TrendChart year={year} />

          {/* Category Pie Charts */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <CategoryPieChart month={month} year={year} type="expense" />
            <CategoryPieChart month={month} year={year} type="income" />
          </div>
        </TabsContent>

        {/* Debt Reports */}
        <TabsContent value="debts" className="mt-4 sm:mt-6">
          <DebtSummaryReport />
        </TabsContent>

        {/* Savings Reports */}
        <TabsContent value="savings" className="mt-4 sm:mt-6">
          <SavingsSummaryReport />
        </TabsContent>

        {/* Recurring Reports */}
        <TabsContent value="recurring" className="mt-4 sm:mt-6">
          <RecurringSummaryReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
