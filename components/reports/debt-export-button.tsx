"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinance } from "@/contexts/finance-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export function DebtExportButton() {
  const { debts } = useFinance();

  const filename = `utang-piutang-${new Date().toISOString().split("T")[0]}`;

  const handleExportCSV = () => {
    const headers = [
      "Nama",
      "Tipe",
      "Nominal",
      "Keterangan",
      "Tanggal Jatuh Tempo",
      "Status",
      "Tanggal Dibuat",
    ];

    const rows = debts.map((d) => [
      d.personName,
      d.type === "receivable" ? "Piutang" : "Utang",
      d.amount.toString(),
      d.description || "-",
      d.dueDate ? formatDate(d.dueDate) : "-",
      d.isPaid ? "Lunas" : "Belum Lunas",
      formatDate(d.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .receivable { color: green; }
          .payable { color: red; }
          .paid { background-color: #d4edda; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Tipe</th>
              <th>Nominal</th>
              <th>Keterangan</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
              <th>Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody>
    `;

    debts.forEach((d) => {
      html += `
        <tr class="${d.isPaid ? "paid" : ""}">
          <td>${d.personName}</td>
          <td class="${d.type}">${
        d.type === "receivable" ? "Piutang" : "Utang"
      }</td>
          <td style="text-align: right">${formatCurrency(d.amount)}</td>
          <td>${d.description || "-"}</td>
          <td>${d.dueDate ? formatDate(d.dueDate) : "-"}</td>
          <td>${d.isPaid ? "Lunas" : "Belum Lunas"}</td>
          <td>${formatDate(d.createdAt)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={debts.length === 0}>
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
