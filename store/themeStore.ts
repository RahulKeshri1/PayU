/**
 * Theme Store (Zustand + AsyncStorage)
 * Manages light/dark mode and currency selection
 */

import { create } from "zustand";
import { ThemeMode } from "../constants/theme";
import { storage } from "../utils/storage";

interface ThemeState {
  mode: ThemeMode;
  currency: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setCurrency: (symbol: string) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "dark", // Default to dark (from screenshots)
  currency: "₹", // Default to INR
  isLoading: false,
  error: null,

  // Load theme preference from storage
  loadTheme: async () => {
    set({ isLoading: true });
    try {
      const storedMode = await storage.getItem("theme_mode");
      const storedCurrency = await storage.getItem("currency");

      set({
        mode: (storedMode as ThemeMode) || "dark",
        currency: storedCurrency || "₹",
        error: null,
      });
    } catch (error) {
      set({ error: `Failed to load theme: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  // Set theme to light or dark
  setTheme: async (mode: ThemeMode) => {
    try {
      set({ mode });
      await storage.setItem("theme_mode", mode);
    } catch (error) {
      console.error("Failed to save theme:", error);
      set({ error: `Failed to save theme: ${error}` });
      throw error;
    }
  },

  // Toggle between light and dark
  toggleTheme: async () => {
    const state = get();
    const newMode: ThemeMode = state.mode === "light" ? "dark" : "light";
    await get().setTheme(newMode);
  },

  // Set currency symbol
  setCurrency: async (symbol: string) => {
    try {
      set({ currency: symbol });
      await storage.setItem("currency", symbol);
    } catch (error) {
      console.error("Failed to save currency:", error);
      set({ error: `Failed to save currency: ${error}` });
      throw error;
    }
  },
}));
