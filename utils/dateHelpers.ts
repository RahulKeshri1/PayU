/**
 * Date utilities for PayU
 * Uses date-fns for manipulation, stores dates as ISO strings
 */

import {
    addDays,
    endOfWeek,
    format,
    isToday,
    isYesterday,
    parseISO,
    startOfWeek,
    subDays
} from "date-fns";

/**
 * Convert Date or ISO string to ISO string
 */
export const toISODate = (date: Date | string): string => {
  if (typeof date === "string") {
    return date;
  }
  return date.toISOString();
};

/**
 * Convert ISO string to Date
 */
export const parseISODate = (isoString: string): Date => {
  return parseISO(isoString);
};

/**
 * Get current date as ISO string (today)
 */
export const getTodayISO = (): string => {
  return new Date().toISOString();
};

/**
 * Get date string for display (e.g., "Today", "Yesterday", "Apr 5")
 */
export const getDateLabel = (isoString: string): string => {
  const date = parseISODate(isoString);
  const today = new Date();

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  // For dates older than 2 days, show "Apr 5", "Mar 1", etc.
  return format(date, "MMM d");
};

/**
 * Get formatted time (e.g., "2:30 PM")
 */
export const getTimeLabel = (isoString: string): string => {
  const date = parseISODate(isoString);
  return format(date, "h:mm a");
};

/**
 * Format date for display with optional time (e.g., "Today, 2:30 PM")
 */
export const getFullDateLabel = (
  isoString: string,
  includeTime: boolean = false,
): string => {
  const dateLabel = getDateLabel(isoString);
  if (includeTime) {
    const timeLabel = getTimeLabel(isoString);
    return `${dateLabel}, ${timeLabel}`;
  }
  return dateLabel;
};

/**
 * Group transactions by date (ISO format without time)
 * Returns array of {date, label, transactions}
 */
export const groupByDate = (
  transactions: Array<{ timestamp: string }>,
): Array<{
  date: string; // ISO date YYYY-MM-DD
  label: string; // Display label like "Today", "Apr 5"
  transactions: Array<{ timestamp: string }>;
}> => {
  const groups = new Map<
    string,
    {
      date: string;
      label: string;
      transactions: Array<{ timestamp: string }>;
    }
  >();

  for (const txn of transactions) {
    const dateObj = parseISODate(txn.timestamp);
    const dateKey = format(dateObj, "yyyy-MM-dd");
    const label = getDateLabel(txn.timestamp);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date: dateKey,
        label,
        transactions: [],
      });
    }

    groups.get(dateKey)!.transactions.push(txn);
  }

  // Sort by date descending (newest first)
  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

/**
 * Get month and year from ISO string
 */
export const getMonthYear = (
  isoString: string,
): { month: number; year: number } => {
  const date = parseISODate(isoString);
  return {
    month: date.getMonth() + 1, // 1-12
    year: date.getFullYear(),
  };
};

/**
 * Get month label (e.g., "April", "Apr")
 */
export const getMonthLabel = (
  month: number,
  year: number,
  short: boolean = true,
): string => {
  const date = new Date(year, month - 1, 1);
  return format(date, short ? "MMM" : "MMMM");
};

/**
 * Get start and end dates for a month
 */
export const getMonthRange = (
  month: number,
  year: number,
): { start: string; end: string } => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  return {
    start: format(startDate, "yyyy-MM-dd"),
    end: format(endDate, "yyyy-MM-dd"),
  };
};

/**
 * Get week number and year from ISO string
 */
export const getWeekNumber = (
  isoString: string,
): { week: number; year: number } => {
  const date = parseISODate(isoString);
  // Simple week calculation (ISO week)
  const weekNo = Math.ceil(
    ((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) /
      86400000 +
      new Date(date.getFullYear(), 0, 1).getDay()) /
      7,
  );
  return { week: weekNo, year: date.getFullYear() };
};

/**
 * Get start and end dates for a week
 */
export const getWeekRange = (
  isoString: string,
): { start: string; end: string } => {
  const date = parseISODate(isoString);
  const start = startOfWeek(date);
  const end = endOfWeek(date);

  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
};

/**
 * Check if transaction is in current month
 */
export const isCurrentMonth = (isoString: string): boolean => {
  const txnDate = parseISODate(isoString);
  const today = new Date();
  return (
    txnDate.getMonth() === today.getMonth() &&
    txnDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Navigate to previous/next month
 */
export const navigateMonth = (
  month: number,
  year: number,
  direction: "prev" | "next",
): { month: number; year: number } => {
  const date = new Date(year, month - 1, 1);
  const newDate = direction === "prev" ? subDays(date, 1) : addDays(date, 32);

  return {
    month: newDate.getMonth() + 1,
    year: newDate.getFullYear(),
  };
};
