/**
 * PayU Finance App Type Definitions
 */

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Always in default currency (₹), stored as number
  category: string; // Category name (Food, Transport, etc.)
  categoryIcon: string; // Emoji or icon identifier
  categoryColor: string; // Hex color for category
  title: string; // User-provided title (e.g., "Lunch")
  note?: string; // Optional detailed note
  date: string; // ISO date string (YYYY-MM-DD) for grouping, not timestamp
  timestamp: string; // Full ISO timestamp (ISO 8601) for precise tracking
  createdAt: string; // ISO timestamp when record was created
  updatedAt: string; // ISO timestamp when record was last updated
}

export interface Category {
  id: string;
  name: string;
  emoji: string; // Emoji icon (e.g., "🍔")
  color: string; // Hex color code
  isCustom: boolean; // Whether user created this or it's predefined
  type: "income" | "expense" | "both"; // Which transaction type this applies to
  order: number; // For sorting in UI
}

export interface MonthlyStats {
  year: number;
  month: number; // 1-12
  income: number;
  expense: number;
  balance: number; // income - expense
  transactionCount: number;
  categoryBreakdown: {
    [categoryName: string]: {
      amount: number;
      percentage: number;
      count: number;
    };
  };
  dailyBreakdown: {
    [date: string]: {
      income: number;
      expense: number;
    };
  };
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  currency: string; // Symbol or code (default "₹")
  themeMode: "light" | "dark";
}

export interface FormTransaction {
  type: TransactionType;
  amount: string; // String form value (e.g., "500.50")
  category: string; // Category ID or name
  title: string;
  note?: string;
  date: Date; // JavaScript Date object for form
}
