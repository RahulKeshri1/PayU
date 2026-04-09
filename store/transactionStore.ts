/**
 * Transaction Store (Zustand + AsyncStorage)
 * Manages all transactions with automatic persistence
 */

import { create } from "zustand";
import { MonthlyStats, Transaction } from "../types";
import { getMonthRange, getTodayISO } from "../utils/dateHelpers";
import { storage } from "../utils/storage";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  restoreTransaction: (transaction: Transaction) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByMonth: (month: number, year: number) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  clearAllTransactions: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  getMonthlyStats: (month: number, year: number) => MonthlyStats;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  // Load transactions from storage
  loadTransactions: async () => {
    set({ isLoading: true });
    try {
      const stored = await storage.getItem("transactions");
      if (stored && Array.isArray(stored)) {
        set({ transactions: stored, error: null });
      }
    } catch (error) {
      set({ error: `Failed to load transactions: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add new transaction
  addTransaction: async (transaction) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: getTodayISO(),
        updatedAt: getTodayISO(),
      };

      const state = get();
      const updated = [newTransaction, ...state.transactions];
      set({ transactions: updated });
      await storage.setItem("transactions", updated);
    } catch (error) {
      set({ error: `Failed to add transaction: ${error}` });
    }
  },

  // Update existing transaction
  updateTransaction: async (id, updates) => {
    try {
      const state = get();
      const updated = state.transactions.map((txn) =>
        txn.id === id
          ? {
              ...txn,
              ...updates,
              updatedAt: getTodayISO(),
            }
          : txn,
      );

      set({ transactions: updated });
      await storage.setItem("transactions", updated);
    } catch (error) {
      set({ error: `Failed to update transaction: ${error}` });
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    try {
      const state = get();
      const updated = state.transactions.filter((txn) => txn.id !== id);
      set({ transactions: updated });
      await storage.setItem("transactions", updated);
    } catch (error) {
      set({ error: `Failed to delete transaction: ${error}` });
    }
  },

  // Restore previously deleted transaction (keeps original id/timestamps)
  restoreTransaction: async (transaction) => {
    try {
      const state = get();
      const exists = state.transactions.some(
        (txn) => txn.id === transaction.id,
      );
      if (exists) {
        return;
      }

      const updated = [transaction, ...state.transactions].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      set({ transactions: updated });
      await storage.setItem("transactions", updated);
    } catch (error) {
      set({ error: `Failed to restore transaction: ${error}` });
    }
  },

  // Get transaction by ID
  getTransactionById: (id) => {
    return get().transactions.find((txn) => txn.id === id);
  },

  // Get transactions for specific month
  getTransactionsByMonth: (month, year) => {
    const { start, end } = getMonthRange(month, year);
    return get().transactions.filter((txn) => {
      const dateKey = txn.date; // stored as YYYY-MM-DD
      return dateKey >= start && dateKey <= end;
    });
  },

  // Get recent transactions
  getRecentTransactions: (limit = 5) => {
    return get()
      .transactions.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  },

  // Clear all transactions
  clearAllTransactions: async () => {
    try {
      set({ transactions: [] });
      await storage.removeItem("transactions");
    } catch (error) {
      set({ error: `Failed to clear transactions: ${error}` });
    }
  },

  // Calculate monthly statistics
  getMonthlyStats: (month, year) => {
    const monthTransactions = get().getTransactionsByMonth(month, year);
    const { start, end } = getMonthRange(month, year);

    let income = 0;
    let expense = 0;
    const categoryBreakdown: MonthlyStats["categoryBreakdown"] = {};
    const dailyBreakdown: MonthlyStats["dailyBreakdown"] = {};

    // Initialize daily breakdown for all days in month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateKey = d.toISOString().split("T")[0];
      dailyBreakdown[dateKey] = { income: 0, expense: 0 };
    }

    // Process transactions
    for (const txn of monthTransactions) {
      if (txn.type === "income") {
        income += txn.amount;
      } else {
        expense += txn.amount;
      }

      // Category breakdown
      if (!categoryBreakdown[txn.category]) {
        categoryBreakdown[txn.category] = {
          amount: 0,
          percentage: 0,
          count: 0,
        };
      }
      categoryBreakdown[txn.category].amount += txn.amount;
      categoryBreakdown[txn.category].count += 1;

      // Daily breakdown
      if (dailyBreakdown[txn.date]) {
        if (txn.type === "income") {
          dailyBreakdown[txn.date].income += txn.amount;
        } else {
          dailyBreakdown[txn.date].expense += txn.amount;
        }
      }
    }

    // Calculate percentages for categories
    const totalExpense = expense;
    for (const category of Object.keys(categoryBreakdown)) {
      categoryBreakdown[category].percentage =
        totalExpense > 0
          ? (categoryBreakdown[category].amount / totalExpense) * 100
          : 0;
    }

    return {
      year,
      month,
      income,
      expense,
      balance: income - expense,
      transactionCount: monthTransactions.length,
      categoryBreakdown,
      dailyBreakdown,
    };
  },
}));
