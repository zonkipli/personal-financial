"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Category, Transaction, Budget, Debt, Wallet } from "@/types";
import { useAuth } from "./auth-context";

// <CHANGE> Added wallet-related types and methods to context
interface FinanceContextType {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: Debt[];
  wallets: Wallet[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addCategory: (
    category: Omit<Category, "id" | "userId" | "createdAt">
  ) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "userId" | "createdAt">
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (
    budget: Omit<Budget, "id" | "userId" | "createdAt">
  ) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, "id" | "userId" | "createdAt">) => Promise<void>;
  updateDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  markDebtAsPaid: (id: string) => Promise<void>;
  addWallet: (
    wallet: Omit<Wallet, "id" | "userId" | "createdAt">
  ) => Promise<void>;
  updateWallet: (id: string, wallet: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  getDebtStats: () => {
    totalReceivable: number;
    totalPayable: number;
    balance: number;
  };
  getMonthlyStats: (
    month: number,
    year: number
  ) => { income: number; expense: number; balance: number };
  getBudgetStatus: (
    month: number,
    year: number
  ) => { budget: number; spent: number; remaining: number; percentage: number };
  getDefaultWallet: () => Wallet | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      "x-user-id": user?.id || "",
    };
  }, [user]);

  // <CHANGE> Added wallets to refreshData
  const refreshData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [catRes, txnRes, budgetRes, debtRes, walletRes] = await Promise.all(
        [
          fetch("/api/categories", { headers: getHeaders() }),
          fetch("/api/transactions", { headers: getHeaders() }),
          fetch("/api/budgets", { headers: getHeaders() }),
          fetch("/api/debts", { headers: getHeaders() }),
          fetch("/api/wallets", { headers: getHeaders() }),
        ]
      );

      const [catData, txnData, budgetData, debtData, walletData] =
        await Promise.all([
          catRes.json(),
          txnRes.json(),
          budgetRes.json(),
          debtRes.json(),
          walletRes.json(),
        ]);

      if (catData.success) setCategories(catData.categories);
      if (txnData.success) setTransactions(txnData.transactions);
      if (budgetData.success) setBudgets(budgetData.budgets);
      if (debtData.success) setDebts(debtData.debts);
      if (walletData.success) setWallets(walletData.wallets);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, getHeaders]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setCategories([]);
      setTransactions([]);
      setBudgets([]);
      setDebts([]);
      setWallets([]);
    }
  }, [user, refreshData]);

  // ... existing code for addCategory, updateCategory, deleteCategory ...

  const addCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(categoryData),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.category]);
      }
    },
    [user, getHeaders]
  );

  const updateCategory = useCallback(
    async (id: string, categoryData: Partial<Category>) => {
      await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(categoryData),
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...categoryData } : c))
      );
    },
    [getHeaders]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    },
    [getHeaders]
  );

  const addTransaction = useCallback(
    async (
      transactionData: Omit<Transaction, "id" | "userId" | "createdAt">
    ) => {
      if (!user) return;
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(transactionData),
      });
      const data = await res.json();
      if (data.success) {
        setTransactions((prev) => [data.transaction, ...prev]);
        // <CHANGE> Update wallet balance after transaction
        if (transactionData.walletId) {
          const amount =
            transactionData.type === "income"
              ? transactionData.amount
              : -transactionData.amount;
          setWallets((prev) =>
            prev.map((w) =>
              w.id === transactionData.walletId
                ? { ...w, balance: w.balance + amount }
                : w
            )
          );
        }
      }
    },
    [user, getHeaders]
  );

  const updateTransaction = useCallback(
    async (id: string, transactionData: Partial<Transaction>) => {
      await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(transactionData),
      });
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...transactionData } : t))
      );
    },
    [getHeaders]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    [getHeaders]
  );

  const addBudget = useCallback(
    async (budgetData: Omit<Budget, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(budgetData),
      });
      const data = await res.json();
      if (data.success) {
        setBudgets((prev) => {
          const filtered = prev.filter(
            (b) =>
              !(
                b.categoryId === data.budget.categoryId &&
                b.month === data.budget.month &&
                b.year === data.budget.year
              )
          );
          return [...filtered, data.budget];
        });
      }
    },
    [user, getHeaders]
  );

  const updateBudget = useCallback(
    async (id: string, budgetData: Partial<Budget>) => {
      await fetch(`/api/budgets/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(budgetData),
      });
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...budgetData } : b))
      );
    },
    [getHeaders]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    },
    [getHeaders]
  );

  const addDebt = useCallback(
    async (debtData: Omit<Debt, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(debtData),
      });
      const data = await res.json();
      if (data.success) {
        setDebts((prev) => [data.debt, ...prev]);
      }
    },
    [user, getHeaders]
  );

  const updateDebt = useCallback(
    async (id: string, debtData: Partial<Debt>) => {
      await fetch(`/api/debts/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(debtData),
      });
      setDebts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...debtData } : d))
      );
    },
    [getHeaders]
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      await fetch(`/api/debts/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      setDebts((prev) => prev.filter((d) => d.id !== id));
    },
    [getHeaders]
  );

  const markDebtAsPaid = useCallback(
    async (id: string) => {
      await fetch(`/api/debts/${id}/pay`, {
        method: "POST",
        headers: getHeaders(),
      });
      setDebts((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                isPaid: true,
                paidDate: new Date().toISOString().split("T")[0],
              }
            : d
        )
      );
    },
    [getHeaders]
  );

  // <CHANGE> Added wallet CRUD functions
  const addWallet = useCallback(
    async (walletData: Omit<Wallet, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(walletData),
      });
      const data = await res.json();
      if (data.success) {
        if (walletData.isDefault) {
          setWallets((prev) => [
            ...prev.map((w) => ({ ...w, isDefault: false })),
            data.wallet,
          ]);
        } else {
          setWallets((prev) => [...prev, data.wallet]);
        }
      }
    },
    [user, getHeaders]
  );

  const updateWallet = useCallback(
    async (id: string, walletData: Partial<Wallet>) => {
      await fetch(`/api/wallets/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(walletData),
      });
      if (walletData.isDefault) {
        setWallets((prev) =>
          prev.map((w) =>
            w.id === id ? { ...w, ...walletData } : { ...w, isDefault: false }
          )
        );
      } else {
        setWallets((prev) =>
          prev.map((w) => (w.id === id ? { ...w, ...walletData } : w))
        );
      }
    },
    [getHeaders]
  );

  const deleteWallet = useCallback(
    async (id: string) => {
      await fetch(`/api/wallets/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      setWallets((prev) => prev.filter((w) => w.id !== id));
    },
    [getHeaders]
  );

  const getDefaultWallet = useCallback(() => {
    return wallets.find((w) => w.isDefault) || wallets[0];
  }, [wallets]);

  const getDebtStats = useCallback(() => {
    const unpaidDebts = debts.filter((d) => !d.isPaid);
    const totalReceivable = unpaidDebts
      .filter((d) => d.type === "receivable")
      .reduce((sum, d) => sum + d.amount, 0);
    const totalPayable = unpaidDebts
      .filter((d) => d.type === "payable")
      .reduce((sum, d) => sum + d.amount, 0);
    return {
      totalReceivable,
      totalPayable,
      balance: totalReceivable - totalPayable,
    };
  }, [debts]);

  const getMonthlyStats = useCallback(
    (month: number, year: number) => {
      const monthlyTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });

      const income = monthlyTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return { income, expense, balance: income - expense };
    },
    [transactions]
  );

  const getBudgetStatus = useCallback(
    (month: number, year: number) => {
      const monthlyBudget = budgets.find(
        (b) => b.month === month && b.year === year && b.categoryId === null
      );
      const budget = monthlyBudget?.amount || 0;
      const { expense: spent } = getMonthlyStats(month, year);
      const remaining = budget - spent;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;

      return { budget, spent, remaining, percentage };
    },
    [budgets, getMonthlyStats]
  );

  return (
    <FinanceContext.Provider
      value={{
        categories,
        transactions,
        budgets,
        debts,
        wallets,
        isLoading,
        refreshData,
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
        addWallet,
        updateWallet,
        deleteWallet,
        getDebtStats,
        getMonthlyStats,
        getBudgetStatus,
        getDefaultWallet,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
