/**
 * Category Store (Zustand + AsyncStorage)
 * Manages predefined and custom categories
 */

import { create } from "zustand";
import {
    PREDEFINED_CATEGORIES,
    getCategoryById
} from "../constants/categories";
import { Category } from "../types";
import { storage } from "../utils/storage";

interface CategoryState {
  customCategories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addCustomCategory: (
    category: Omit<Category, "id" | "isCustom">,
  ) => Promise<void>;
  deleteCustomCategory: (id: string) => Promise<void>;
  getAllCategories: () => Category[];
  getCategoriesForType: (type: "income" | "expense" | "both") => Category[];
  getCategoryById: (id: string) => Category | undefined;
  loadCategories: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  customCategories: [],
  isLoading: false,
  error: null,

  // Load custom categories from storage
  loadCategories: async () => {
    set({ isLoading: true });
    try {
      const stored = await storage.getItem("custom_categories");
      if (stored && Array.isArray(stored)) {
        set({ customCategories: stored, error: null });
      }
    } catch (error) {
      set({ error: `Failed to load categories: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add custom category
  addCustomCategory: async (category) => {
    try {
      const newCategory: Category = {
        ...category,
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isCustom: true,
      };

      const state = get();
      const updated = [...state.customCategories, newCategory];
      set({ customCategories: updated });
      await storage.setItem("custom_categories", updated);
    } catch (error) {
      set({ error: `Failed to add category: ${error}` });
    }
  },

  // Delete custom category
  deleteCustomCategory: async (id) => {
    try {
      const state = get();
      const updated = state.customCategories.filter((cat) => cat.id !== id);
      set({ customCategories: updated });
      await storage.setItem("custom_categories", updated);
    } catch (error) {
      set({ error: `Failed to delete category: ${error}` });
    }
  },

  // Get all categories (predefined + custom)
  getAllCategories: () => {
    const customCategories = get().customCategories;
    return [...PREDEFINED_CATEGORIES, ...customCategories].sort(
      (a, b) => a.order - b.order,
    );
  },

  // Get categories filtered by type
  getCategoriesForType: (type: "income" | "expense" | "both" = "both") => {
    const allCategories = get().getAllCategories();
    if (type === "both") return allCategories;
    return allCategories.filter(
      (cat) => cat.type === type || cat.type === "both",
    );
  },

  // Get category by ID
  getCategoryById: (id) => {
    const customCats = get().customCategories;
    return getCategoryById(id, customCats);
  },

  // Reset to predefined categories (delete all custom)
  resetToDefaults: async () => {
    try {
      set({ customCategories: [] });
      await storage.removeItem("custom_categories");
    } catch (error) {
      set({ error: `Failed to reset categories: ${error}` });
    }
  },
}));
