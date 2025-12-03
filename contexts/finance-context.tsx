"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Category, Transaction, Budget } from "@/types"
import {
  getStoredCategories,
  setStoredCategories,
  getStoredTransactions,
  setStoredTransactions,
  getStoredBudgets,
  setStoredBudgets,
  generateId,
} from "@/lib/storage"
import { useAuth } from "./auth-context"

interface FinanceContextType {
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  addCategory: (category: Omit<Category, "id" | "userId" | "createdAt">) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addTransaction: (transaction: Omit<Transaction, "id" | "userId" | "createdAt">) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addBudget: (budget: Omit<Budget, "id" | "userId" | "createdAt">) => void
  updateBudget: (id: string, budget: Partial<Budget>) => void
  deleteBudget: (id: string) => void
  getMonthlyStats: (month: number, year: number) => { income: number; expense: number; balance: number }
  getBudgetStatus: (
    month: number,
    year: number,
  ) => { budget: number; spent: number; remaining: number; percentage: number }
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])

  useEffect(() => {
    if (user) {
      const storedCategories = getStoredCategories().filter((c) => c.userId === user.id)
      const storedTransactions = getStoredTransactions().filter((t) => t.userId === user.id)
      const storedBudgets = getStoredBudgets().filter((b) => b.userId === user.id)
      setCategories(storedCategories)
      setTransactions(storedTransactions)
      setBudgets(storedBudgets)
    } else {
      setCategories([])
      setTransactions([])
      setBudgets([])
    }
  }, [user])

  // Category functions
  const addCategory = useCallback(
    (categoryData: Omit<Category, "id" | "userId" | "createdAt">) => {
      if (!user) return
      const newCategory: Category = {
        ...categoryData,
        id: generateId("cat"),
        userId: user.id,
        createdAt: new Date().toISOString(),
      }
      const updatedCategories = [...getStoredCategories(), newCategory]
      setStoredCategories(updatedCategories)
      setCategories(updatedCategories.filter((c) => c.userId === user.id))
    },
    [user],
  )

  const updateCategory = useCallback(
    (id: string, categoryData: Partial<Category>) => {
      const allCategories = getStoredCategories()
      const updatedCategories = allCategories.map((c) => (c.id === id ? { ...c, ...categoryData } : c))
      setStoredCategories(updatedCategories)
      setCategories(updatedCategories.filter((c) => c.userId === user?.id))
    },
    [user],
  )

  const deleteCategory = useCallback(
    (id: string) => {
      const allCategories = getStoredCategories()
      const updatedCategories = allCategories.filter((c) => c.id !== id)
      setStoredCategories(updatedCategories)
      setCategories(updatedCategories.filter((c) => c.userId === user?.id))
    },
    [user],
  )

  // Transaction functions
  const addTransaction = useCallback(
    (transactionData: Omit<Transaction, "id" | "userId" | "createdAt">) => {
      if (!user) return
      const newTransaction: Transaction = {
        ...transactionData,
        id: generateId("txn"),
        userId: user.id,
        createdAt: new Date().toISOString(),
      }
      const updatedTransactions = [...getStoredTransactions(), newTransaction]
      setStoredTransactions(updatedTransactions)
      setTransactions(updatedTransactions.filter((t) => t.userId === user.id))
    },
    [user],
  )

  const updateTransaction = useCallback(
    (id: string, transactionData: Partial<Transaction>) => {
      const allTransactions = getStoredTransactions()
      const updatedTransactions = allTransactions.map((t) => (t.id === id ? { ...t, ...transactionData } : t))
      setStoredTransactions(updatedTransactions)
      setTransactions(updatedTransactions.filter((t) => t.userId === user?.id))
    },
    [user],
  )

  const deleteTransaction = useCallback(
    (id: string) => {
      const allTransactions = getStoredTransactions()
      const updatedTransactions = allTransactions.filter((t) => t.id !== id)
      setStoredTransactions(updatedTransactions)
      setTransactions(updatedTransactions.filter((t) => t.userId === user?.id))
    },
    [user],
  )

  // Budget functions
  const addBudget = useCallback(
    (budgetData: Omit<Budget, "id" | "userId" | "createdAt">) => {
      if (!user) return
      const newBudget: Budget = {
        ...budgetData,
        id: generateId("budget"),
        userId: user.id,
        createdAt: new Date().toISOString(),
      }
      const updatedBudgets = [...getStoredBudgets(), newBudget]
      setStoredBudgets(updatedBudgets)
      setBudgets(updatedBudgets.filter((b) => b.userId === user.id))
    },
    [user],
  )

  const updateBudget = useCallback(
    (id: string, budgetData: Partial<Budget>) => {
      const allBudgets = getStoredBudgets()
      const updatedBudgets = allBudgets.map((b) => (b.id === id ? { ...b, ...budgetData } : b))
      setStoredBudgets(updatedBudgets)
      setBudgets(updatedBudgets.filter((b) => b.userId === user?.id))
    },
    [user],
  )

  const deleteBudget = useCallback(
    (id: string) => {
      const allBudgets = getStoredBudgets()
      const updatedBudgets = allBudgets.filter((b) => b.id !== id)
      setStoredBudgets(updatedBudgets)
      setBudgets(updatedBudgets.filter((b) => b.userId === user?.id))
    },
    [user],
  )

  // Stats functions
  const getMonthlyStats = useCallback(
    (month: number, year: number) => {
      const monthlyTransactions = transactions.filter((t) => {
        const date = new Date(t.date)
        return date.getMonth() + 1 === month && date.getFullYear() === year
      })

      const income = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const expense = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      return { income, expense, balance: income - expense }
    },
    [transactions],
  )

  const getBudgetStatus = useCallback(
    (month: number, year: number) => {
      const monthlyBudget = budgets.find((b) => b.month === month && b.year === year && b.categoryId === null)
      const budget = monthlyBudget?.amount || 0
      const { expense: spent } = getMonthlyStats(month, year)
      const remaining = budget - spent
      const percentage = budget > 0 ? (spent / budget) * 100 : 0

      return { budget, spent, remaining, percentage }
    },
    [budgets, getMonthlyStats],
  )

  return (
    <FinanceContext.Provider
      value={{
        categories,
        transactions,
        budgets,
        addCategory,
        updateCategory,
        deleteCategory,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        getMonthlyStats,
        getBudgetStatus,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
