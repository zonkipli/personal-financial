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

export interface Debt {
  id: string
  userId: string
  type: "receivable" | "payable" // receivable = orang lain hutang ke kita, payable = kita hutang ke orang lain
  personName: string
  amount: number
  description: string
  dueDate: string | null
  isPaid: boolean
  paidDate: string | null
  createdAt: string
}

export interface SavingsGoal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  description: string
  isCompleted: boolean
  createdAt: string
}

export interface RecurringTransaction {
  id: string
  userId: string
  categoryId: string
  type: "income" | "expense"
  amount: number
  description: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  startDate: string
  endDate: string | null
  isActive: boolean
  lastProcessed: string | null
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
