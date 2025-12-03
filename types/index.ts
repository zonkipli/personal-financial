// Core types for the finance application

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Category {
  id: string
  userId: string
  name: string
  type: "income" | "expense"
  color: string
  icon: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  categoryId: string
  type: "income" | "expense"
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface Budget {
  id: string
  userId: string
  categoryId: string | null // null = total budget
  amount: number
  month: number // 1-12
  year: number
  createdAt: string
}

export interface MonthlyReport {
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  balance: number
  transactions: Transaction[]
  categoryBreakdown: {
    categoryId: string
    categoryName: string
    amount: number
    percentage: number
  }[]
}
