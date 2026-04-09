/**
 * Custom hooks for transactions
 */

import { useEffect } from "react";
import { useTransactionStore } from "../store/transactionStore";
import { MonthlyStats } from "../types";

/**
 * Hook to access transactions with loading state
 */
export const useTransactions = () => {
  const { transactions, isLoading, error, loadTransactions } =
    useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
  };
};

/**
 * Hook to get monthly statistics
 */
export const useMonthlyStats = (month: number, year: number): MonthlyStats => {
  const getMonthlyStats = useTransactionStore((state) => state.getMonthlyStats);
  return getMonthlyStats(month, year);
};

/**
 * Hook to filter transactions
 */
export const useFilteredTransactions = (type?: "income" | "expense") => {
  const transactions = useTransactionStore((state) => state.transactions);

  if (!type) return transactions;

  return transactions.filter((txn) => txn.type === type);
};

/**
 * Hook to search transactions
 */
export const useSearchTransactions = (query: string) => {
  const transactions = useTransactionStore((state) => state.transactions);

  if (!query.trim()) return transactions;

  const lowercaseQuery = query.toLowerCase();
  return transactions.filter(
    (txn) =>
      txn.title.toLowerCase().includes(lowercaseQuery) ||
      txn.category.toLowerCase().includes(lowercaseQuery) ||
      (txn.note && txn.note.toLowerCase().includes(lowercaseQuery)),
  );
};
