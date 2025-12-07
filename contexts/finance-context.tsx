"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Category, Transaction, Budget, Debt, SavingsGoal, RecurringTransaction } from "@/types";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

interface FinanceContextType {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  recurringTransactions: RecurringTransaction[];
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
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "userId" | "createdAt">) => Promise<void>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, "id" | "userId" | "createdAt">) => Promise<void>;
  updateRecurringTransaction: (id: string, recurring: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
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
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      "x-user-id": user?.id || "",
    };
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [catRes, txnRes, budgetRes, debtRes, savingsRes, recurringRes] = await Promise.all([
        fetch("/api/categories", { headers: getHeaders() }),
        fetch("/api/transactions", { headers: getHeaders() }),
        fetch("/api/budgets", { headers: getHeaders() }),
        fetch("/api/debts", { headers: getHeaders() }),
        fetch("/api/savings-goals", { headers: getHeaders() }),
        fetch("/api/recurring-transactions", { headers: getHeaders() }),
      ]);

      const [catData, txnData, budgetData, debtData, savingsData, recurringData] = await Promise.all([
        catRes.json(),
        txnRes.json(),
        budgetRes.json(),
        debtRes.json(),
        savingsRes.json(),
        recurringRes.json(),
      ]);

      if (catData.success) setCategories(catData.categories);
      if (txnData.success) setTransactions(txnData.transactions);
      if (budgetData.success) setBudgets(budgetData.budgets);
      if (debtData.success) setDebts(debtData.debts);
      if (Array.isArray(savingsData)) setSavingsGoals(savingsData);
      if (Array.isArray(recurringData)) setRecurringTransactions(recurringData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data. Silakan coba lagi.");
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
      setSavingsGoals([]);
      setRecurringTransactions([]);
    }
  }, [user, refreshData]);

  const addCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(categoryData),
        });
        const data = await res.json();
        if (data.success) {
          setCategories((prev) => [...prev, data.category]);
          toast.success("Kategori berhasil ditambahkan");
        } else {
          toast.error(data.error || "Gagal menambahkan kategori");
        }
      } catch (error) {
        console.error("Error adding category:", error);
        toast.error("Gagal menambahkan kategori. Silakan coba lagi.");
      }
    },
    [user, getHeaders]
  );

  const updateCategory = useCallback(
    async (id: string, categoryData: Partial<Category>) => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(categoryData),
        });
        const data = await res.json();
        if (res.ok) {
          setCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...categoryData } : c))
          );
          toast.success("Kategori berhasil diperbarui");
        } else {
          toast.error(data.error || "Gagal memperbarui kategori");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Gagal memperbarui kategori. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) {
          setCategories((prev) => prev.filter((c) => c.id !== id));
          toast.success("Kategori berhasil dihapus");
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal menghapus kategori");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Gagal menghapus kategori. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const addTransaction = useCallback(
    async (
      transactionData: Omit<Transaction, "id" | "userId" | "createdAt">
    ) => {
      if (!user) return;
      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(transactionData),
        });
        const data = await res.json();
        if (data.success) {
          setTransactions((prev) => [data.transaction, ...prev]);
          toast.success("Transaksi berhasil ditambahkan");
        } else {
          toast.error(data.error || "Gagal menambahkan transaksi");
        }
      } catch (error) {
        console.error("Error adding transaction:", error);
        toast.error("Gagal menambahkan transaksi. Silakan coba lagi.");
      }
    },
    [user, getHeaders]
  );

  const updateTransaction = useCallback(
    async (id: string, transactionData: Partial<Transaction>) => {
      try {
        const res = await fetch(`/api/transactions/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(transactionData),
        });
        const data = await res.json();
        if (res.ok) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...transactionData } : t))
          );
          toast.success("Transaksi berhasil diperbarui");
        } else {
          toast.error(data.error || "Gagal memperbarui transaksi");
        }
      } catch (error) {
        console.error("Error updating transaction:", error);
        toast.error("Gagal memperbarui transaksi. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/transactions/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
          toast.success("Transaksi berhasil dihapus");
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal menghapus transaksi");
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Gagal menghapus transaksi. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const addBudget = useCallback(
    async (budgetData: Omit<Budget, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      try {
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
          toast.success("Budget berhasil ditambahkan");
        } else {
          toast.error(data.error || "Gagal menambahkan budget");
        }
      } catch (error) {
        console.error("Error adding budget:", error);
        toast.error("Gagal menambahkan budget. Silakan coba lagi.");
      }
    },
    [user, getHeaders]
  );

  const updateBudget = useCallback(
    async (id: string, budgetData: Partial<Budget>) => {
      try {
        const res = await fetch(`/api/budgets/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(budgetData),
        });
        const data = await res.json();
        if (res.ok) {
          setBudgets((prev) =>
            prev.map((b) => (b.id === id ? { ...b, ...budgetData } : b))
          );
          toast.success("Budget berhasil diperbarui");
        } else {
          toast.error(data.error || "Gagal memperbarui budget");
        }
      } catch (error) {
        console.error("Error updating budget:", error);
        toast.error("Gagal memperbarui budget. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/budgets/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) {
          setBudgets((prev) => prev.filter((b) => b.id !== id));
          toast.success("Budget berhasil dihapus");
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal menghapus budget");
        }
      } catch (error) {
        console.error("Error deleting budget:", error);
        toast.error("Gagal menghapus budget. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const addDebt = useCallback(
    async (debtData: Omit<Debt, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      try {
        const res = await fetch("/api/debts", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(debtData),
        });
        const data = await res.json();
        if (data.success) {
          setDebts((prev) => [data.debt, ...prev]);
          toast.success("Hutang/Piutang berhasil ditambahkan");
        } else {
          toast.error(data.error || "Gagal menambahkan hutang/piutang");
        }
      } catch (error) {
        console.error("Error adding debt:", error);
        toast.error("Gagal menambahkan hutang/piutang. Silakan coba lagi.");
      }
    },
    [user, getHeaders]
  );

  const updateDebt = useCallback(
    async (id: string, debtData: Partial<Debt>) => {
      try {
        const res = await fetch(`/api/debts/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(debtData),
        });
        const data = await res.json();
        if (res.ok) {
          setDebts((prev) =>
            prev.map((d) => (d.id === id ? { ...d, ...debtData } : d))
          );
          toast.success("Hutang/Piutang berhasil diperbarui");
        } else {
          toast.error(data.error || "Gagal memperbarui hutang/piutang");
        }
      } catch (error) {
        console.error("Error updating debt:", error);
        toast.error("Gagal memperbarui hutang/piutang. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/debts/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) {
          setDebts((prev) => prev.filter((d) => d.id !== id));
          toast.success("Hutang/Piutang berhasil dihapus");
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal menghapus hutang/piutang");
        }
      } catch (error) {
        console.error("Error deleting debt:", error);
        toast.error("Gagal menghapus hutang/piutang. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const markDebtAsPaid = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/debts/${id}/pay`, {
          method: "POST",
          headers: getHeaders(),
        });
        if (res.ok) {
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
          toast.success("Hutang/Piutang berhasil ditandai lunas");
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal menandai sebagai lunas");
        }
      } catch (error) {
        console.error("Error marking debt as paid:", error);
        toast.error("Gagal menandai sebagai lunas. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

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

  const addSavingsGoal = useCallback(
    async (goalData: Omit<SavingsGoal, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      try {
        const res = await fetch("/api/savings-goals", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(goalData),
        });
        const data = await res.json();
        if (data.id) {
          setSavingsGoals((prev) => [data, ...prev]);
          toast.success("Target tabungan berhasil ditambahkan");
        } else {
          toast.error(data.error || "Gagal menambahkan target tabungan");
        }
      } catch (error) {
        console.error("Error adding savings goal:", error);
        toast.error("Gagal menambahkan target tabungan. Silakan coba lagi.");
      }
    },
    [user, getHeaders]
  );

  const updateSavingsGoal = useCallback(
    async (id: string, goalData: Partial<SavingsGoal>) => {
      try {
        const res = await fetch(`/api/savings-goals/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(goalData),
        });
        const data = await res.json();
        if (res.ok) {
          setSavingsGoals((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...goalData } : g))
          );
          toast.success("Target tabungan berhasil diperbarui");
        } else {
          toast.error(data.error || "Gagal memperbarui target tabungan");
        }
      } catch (error) {
        console.error("Error updating savings goal:", error);
        toast.error("Gagal memperbarui target tabungan. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const deleteSavingsGoal = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/savings-goals/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) {
          setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
          toast.success("Target tabungan berhasil dihapus");
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal menghapus target tabungan");
        }
      } catch (error) {
        console.error("Error deleting savings goal:", error);
        toast.error("Gagal menghapus target tabungan. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const addRecurringTransaction = useCallback(
    async (recurringData: Omit<RecurringTransaction, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      try {
        const res = await fetch("/api/recurring-transactions", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(recurringData),
        });
        const data = await res.json();
        if (data.id) {
          setRecurringTransactions((prev) => [data, ...prev]);
          toast.success("Transaksi berulang berhasil ditambahkan");
        } else {
          toast.error(data.error || "Gagal menambahkan transaksi berulang");
        }
      } catch (error) {
        console.error("Error adding recurring transaction:", error);
        toast.error("Gagal menambahkan transaksi berulang. Silakan coba lagi.");
      }
    },
    [user, getHeaders]
  );

  const updateRecurringTransaction = useCallback(
    async (id: string, recurringData: Partial<RecurringTransaction>) => {
      try {
        const res = await fetch(`/api/recurring-transactions/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(recurringData),
        });
        const data = await res.json();
        if (res.ok) {
          setRecurringTransactions((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...recurringData } : r))
          );
          toast.success("Transaksi berulang berhasil diperbarui");
        } else {
          toast.error(data.error || "Gagal memperbarui transaksi berulang");
        }
      } catch (error) {
        console.error("Error updating recurring transaction:", error);
        toast.error("Gagal memperbarui transaksi berulang. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  const deleteRecurringTransaction = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/recurring-transactions/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) {
          setRecurringTransactions((prev) => prev.filter((r) => r.id !== id));
          toast.success("Transaksi berulang berhasil dihapus");
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal menghapus transaksi berulang");
        }
      } catch (error) {
        console.error("Error deleting recurring transaction:", error);
        toast.error("Gagal menghapus transaksi berulang. Silakan coba lagi.");
      }
    },
    [getHeaders]
  );

  return (
    <FinanceContext.Provider
      value={{
        categories,
        transactions,
        budgets,
        debts,
        savingsGoals,
        recurringTransactions,
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
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        getDebtStats,
        getMonthlyStats,
        getBudgetStatus,
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
