import type { Transaction, Category } from "@/types"
import { formatCurrency, formatDate } from "./format"

interface ExportTransaction extends Transaction {
  categoryName: string
}

export function exportToCSV(transactions: Transaction[], categories: Category[], filename: string): void {
  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Lainnya"
  }

  const headers = ["Tanggal", "Tipe", "Kategori", "Nominal", "Catatan"]

  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type === "income" ? "Pemasukan" : "Pengeluaran",
    getCategoryName(t.categoryId),
    t.amount.toString(),
    t.description || "-",
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToExcel(transactions: Transaction[], categories: Category[], filename: string): void {
  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Lainnya"
  }

  // Create a simple HTML table that Excel can open
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .income { color: green; }
        .expense { color: red; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tipe</th>
            <th>Kategori</th>
            <th>Nominal</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
  `

  transactions.forEach((t) => {
    html += `
      <tr>
        <td>${formatDate(t.date)}</td>
        <td class="${t.type}">${t.type === "income" ? "Pemasukan" : "Pengeluaran"}</td>
        <td>${getCategoryName(t.categoryId)}</td>
        <td style="text-align: right">${formatCurrency(t.amount)}</td>
        <td>${t.description || "-"}</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.xls`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
