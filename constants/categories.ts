import { Category } from "../types";
import { Colors } from "./theme";

export const PREDEFINED_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food",
    emoji: "🍔",
    color: Colors.categories.food,
    isCustom: false,
    type: "expense",
    order: 1,
  },
  {
    id: "transport",
    name: "Transport",
    emoji: "🚗",
    color: Colors.categories.transport,
    isCustom: false,
    type: "expense",
    order: 2,
  },
  {
    id: "shopping",
    name: "Shopping",
    emoji: "🛍️",
    color: Colors.categories.shopping,
    isCustom: false,
    type: "expense",
    order: 3,
  },
  {
    id: "health",
    name: "Health",
    emoji: "🏥",
    color: Colors.categories.health,
    isCustom: false,
    type: "expense",
    order: 4,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    emoji: "🎬",
    color: Colors.categories.entertainment,
    isCustom: false,
    type: "expense",
    order: 5,
  },
  {
    id: "salary",
    name: "Salary",
    emoji: "💰",
    color: Colors.categories.salary,
    isCustom: false,
    type: "income",
    order: 6,
  },
  {
    id: "freelance",
    name: "Freelance",
    emoji: "💻",
    color: Colors.categories.freelance,
    isCustom: false,
    type: "income",
    order: 7,
  },
  {
    id: "investment",
    name: "Investment",
    emoji: "📈",
    color: Colors.categories.investment,
    isCustom: false,
    type: "income",
    order: 8,
  },
  {
    id: "rent",
    name: "Rent",
    emoji: "🏠",
    color: Colors.categories.rent,
    isCustom: false,
    type: "expense",
    order: 9,
  },
  {
    id: "others",
    name: "Others",
    emoji: "📌",
    color: Colors.categories.others,
    isCustom: false,
    type: "both",
    order: 10,
  },
];

/**
 * Get a category by ID
 */
export const getCategoryById = (
  id: string,
  customCategories: Category[] = [],
): Category | undefined => {
  const allCategories = [...PREDEFINED_CATEGORIES, ...customCategories];
  return allCategories.find((cat) => cat.id === id);
};

/**
 * Get categories filtered by type
 */
export const getCategoriesByType = (
  type: "income" | "expense" | "both" = "both",
  customCategories: Category[] = [],
): Category[] => {
  const allCategories = [...PREDEFINED_CATEGORIES, ...customCategories];
  if (type === "both") return allCategories;
  return allCategories.filter(
    (cat) => cat.type === type || cat.type === "both",
  );
};
