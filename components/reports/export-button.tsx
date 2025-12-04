"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinance } from "@/contexts/finance-context";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { getMonthName } from "@/lib/format";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface ExportButtonProps {
  month: number;
  year: number;
}

export function ExportButton({ month, year }: ExportButtonProps) {
  const { transactions, categories } = useFinance();

  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  const filename = `transaksi-${getMonthName(month).toLowerCase()}-${year}`;

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, categories, filename);
  };

  const handleExportExcel = () => {
    exportToExcel(filteredTransactions, categories, filename);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={filteredTransactions.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
