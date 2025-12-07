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
  accountId?: string | null
  type: "income" | "expense"
  amount: number
  currency?: string
  exchangeRate?: number
  description: string
  notes?: string
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

export interface Account {
  id: string
  userId: string
  name: string
  type: "cash" | "bank" | "e-wallet" | "credit-card"
  balance: number
  currency: string
  color: string
  icon: string
  isActive: boolean
  createdAt: string
}

export interface Tag {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
}

export interface Attachment {
  id: string
  userId: string
  transactionId: string | null
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: string
}

export interface AccountTransfer {
  id: string
  userId: string
  fromAccountId: string
  toAccountId: string
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface Investment {
  id: string
  userId: string
  name: string
  type: "stocks" | "crypto" | "mutual-funds" | "gold" | "bonds" | "other"
  symbol: string
  quantity: number
  buyPrice: number
  currentPrice: number
  currency: string
  purchaseDate: string
  notes: string
  createdAt: string
}

export interface SplitBill {
  id: string
  userId: string
  transactionId: string | null
  title: string
  totalAmount: number
  createdAt: string
}

export interface SplitBillParticipant {
  id: string
  splitBillId: string
  name: string
  amount: number
  isPaid: boolean
  paidDate: string | null
}

export interface Reminder {
  id: string
  userId: string
  title: string
  description: string
  amount: number
  dueDate: string
  reminderDate: string
  type: "bill" | "debt" | "savings" | "recurring" | "other"
  relatedId: string | null
  isCompleted: boolean
  createdAt: string
}
