/**
 * Currency formatting utilities
 * All amounts are stored as numbers, formatted using these helpers
 */

import { Colors } from "../constants/theme";

export interface FormatOptions {
  currencySymbol?: string;
  showSign?: boolean; // Show +/- sign
  abbreviate?: boolean; // Abbreviate large numbers
}

/**
 * Format amount as currency string
 * @param amount - Amount in selected currency (default: ₹)
 * @param options - Formatting options
 * @returns Formatted string like "₹500.50" or "₹10K"
 */
export const formatCurrency = (
  amount: number,
  options: FormatOptions = {},
): string => {
  const {
    currencySymbol = "₹",
    showSign = false,
    abbreviate = false,
  } = options;

  // Handle zero
  if (amount === 0) return `${currencySymbol}0.00`;

  // Format number
  let formatted: string;
  let sign = "";

  let absAmount = Math.abs(amount);

  if (abbreviate && absAmount >= 1000000) {
    // Millions: 1.5M
    formatted = (absAmount / 1000000).toFixed(1) + "M";
  } else if (abbreviate && absAmount >= 1000) {
    // Thousands: 15K, 10K
    formatted = (absAmount / 1000).toFixed(0) + "K";
  } else {
    // Regular: 500.50
    formatted = absAmount.toFixed(2);
  }

  if (showSign) {
    sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  } else if (amount < 0) {
    sign = "-";
  }

  return `${sign}${currencySymbol}${formatted}`;
};

/**
 * Format display amount (no currency symbol, suitable for headings)
 */
export const formatAmount = (
  amount: number,
  abbreviate: boolean = false,
): string => {
  const numericPart = Math.abs(amount);

  if (abbreviate && numericPart >= 1000000) {
    return (numericPart / 1000000).toFixed(1) + "M";
  }
  if (abbreviate && numericPart >= 1000) {
    return (numericPart / 1000).toFixed(0) + "K";
  }
  return numericPart.toFixed(2);
};

/**
 * Get color for amount (income = green, expense = red)
 */
export const getAmountColor = (amount: number, isExpense: boolean): string => {
  if (isExpense) {
    return Colors.expense;
  }
  return Colors.income;
};
