// Local storage utility for data persistence
import type { User, Category, Transaction, Budget, Debt } from "@/types"

const STORAGE_KEYS = {
  USER: "finance_user",
  CATEGORIES: "finance_categories",
  TRANSACTIONS: "finance_transactions",
  BUDGETS: "finance_budgets",
  DEBTS: "finance_debts",
}

// User functions
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : null
}

export function setStoredUser(user: User | null): void {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
}

// Categories functions
export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
  return data ? JSON.parse(data) : []
}

export function setStoredCategories(categories: Category[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
}

// Transactions functions
export function getStoredTransactions(): Transaction[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  return data ? JSON.parse(data) : []
}

export function setStoredTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
}

// Budgets functions
export function getStoredBudgets(): Budget[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.BUDGETS)
  return data ? JSON.parse(data) : []
}

export function setStoredBudgets(budgets: Budget[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets))
}

// Debts functions
export function getStoredDebts(): Debt[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.DEBTS)
  return data ? JSON.parse(data) : []
}

export function setStoredDebts(debts: Debt[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts))
}

// Initialize default categories for new users
export function initializeDefaultCategories(userId: string): Category[] {
  const defaultCategories: Category[] = [
    {
      id: "cat_1",
      userId,
      name: "Gaji",
      type: "income",
      color: "#10B981",
      icon: "Wallet",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat_2",
      userId,
      name: "Freelance",
      type: "income",
      color: "#3B82F6",
      icon: "Briefcase",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat_3",
      userId,
      name: "Investasi",
      type: "income",
      color: "#8B5CF6",
      icon: "TrendingUp",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat_4",
      userId,
      name: "Makanan",
      type: "expense",
      color: "#F59E0B",
      icon: "Utensils",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat_5",
      userId,
      name: "Transportasi",
      type: "expense",
      color: "#EF4444",
      icon: "Car",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat_6",
      userId,
      name: "Belanja",
      type: "expense",
      color: "#EC4899",
      icon: "ShoppingBag",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat_7",
      userId,
      name: "Tagihan",
      type: "expense",
      color: "#6366F1",
      icon: "Receipt",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat_8",
      userId,
      name: "Hiburan",
      type: "expense",
      color: "#14B8A6",
      icon: "Gamepad2",
      createdAt: new Date().toISOString(),
    },
  ]
  setStoredCategories(defaultCategories)
  return defaultCategories
}

// Generate unique ID
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
