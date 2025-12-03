"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Category, Transaction, Budget, Debt } from "@/types"
import {
  getStoredCategories,
  setStoredCategories,
  getStoredTransactions,
  setStoredTransactions,
  getStoredBudgets,
  setStoredBudgets,
  getStoredDebts,
  setStoredDebts,
  generateId,
} from "@/lib/storage"
import { useAuth } from "./auth-context"

interface FinanceContextType {
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  debts: Debt[]
  addCategory: (category: Omit<Category, "id" | "userId" | "createdAt">) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addTransaction: (transaction: Omit<Transaction, "id" | "userId" | "createdAt">) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addBudget: (budget: Omit<Budget, "id" | "userId" | "createdAt">) => void
  updateBudget: (id: string, budget: Partial<Budget>) => void
  deleteBudget: (id: string) => void
  addDebt: (debt: Omit<Debt, "id" | "userId" | "createdAt">) => void
  updateDebt: (id: string, debt: Partial<Debt>) => void
  deleteDebt: (id: string) => void
  markDebtAsPaid: (id: string) => void
  getDebtStats: () => { totalReceivable: number; totalPayable: number; balance: number }
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
  const [debts, setDebts] = useState<Debt[]>([])

  useEffect(() => {
    if (user) {
      const storedCategories = getStoredCategories().filter((c) => c.userId === user.id)
      const storedTransactions = getStoredTransactions().filter((t) => t.userId === user.id)
      const storedBudgets = getStoredBudgets().filter((b) => b.userId === user.id)
      const storedDebts = getStoredDebts().filter((d) => d.userId === user.id)
      setCategories(storedCategories)
      setTransactions(storedTransactions)
      setBudgets(storedBudgets)
      setDebts(storedDebts)
    } else {
      setCategories([])
      setTransactions([])
      setBudgets([])
      setDebts([])
    }
  }, [user])

  // ... existing code for category functions ...

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

  const addDebt = useCallback(
    (debtData: Omit<Debt, "id" | "userId" | "createdAt">) => {
      if (!user) return
      const newDebt: Debt = {
        ...debtData,
        id: generateId("debt"),
        userId: user.id,
        createdAt: new Date().toISOString(),
      }
      const updatedDebts = [...getStoredDebts(), newDebt]
      setStoredDebts(updatedDebts)
      setDebts(updatedDebts.filter((d) => d.userId === user.id))
    },
    [user],
  )

  const updateDebt = useCallback(
    (id: string, debtData: Partial<Debt>) => {
      const allDebts = getStoredDebts()
      const updatedDebts = allDebts.map((d) => (d.id === id ? { ...d, ...debtData } : d))
      setStoredDebts(updatedDebts)
      setDebts(updatedDebts.filter((d) => d.userId === user?.id))
    },
    [user],
  )

  const deleteDebt = useCallback(
    (id: string) => {
      const allDebts = getStoredDebts()
      const updatedDebts = allDebts.filter((d) => d.id !== id)
      setStoredDebts(updatedDebts)
      setDebts(updatedDebts.filter((d) => d.userId === user?.id))
    },
    [user],
  )

  const markDebtAsPaid = useCallback(
    (id: string) => {
      updateDebt(id, { isPaid: true, paidDate: new Date().toISOString() })
    },
    [updateDebt],
  )

  const getDebtStats = useCallback(() => {
    const unpaidDebts = debts.filter((d) => !d.isPaid)
    const totalReceivable = unpaidDebts.filter((d) => d.type === "receivable").reduce((sum, d) => sum + d.amount, 0)
    const totalPayable = unpaidDebts.filter((d) => d.type === "payable").reduce((sum, d) => sum + d.amount, 0)
    return {
      totalReceivable,
      totalPayable,
      balance: totalReceivable - totalPayable,
    }
  }, [debts])

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
        debts,
        addCategory,
        updateCategory,
        deleteCategory,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addDebt,
        updateDebt,
        deleteDebt,
        markDebtAsPaid,
        getDebtStats,
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
