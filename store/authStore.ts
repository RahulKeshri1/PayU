/**
 * Auth Store (Zustand + AsyncStorage)
 * Manages user authentication state and session
 */

import { create } from "zustand";
import { storage } from "../utils/storage";

export interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Load session from storage
  loadSession: async () => {
    set({ isLoading: true });
    try {
      const userJson = await storage.getItem("auth_user");
      if (userJson) {
        const user = JSON.parse(userJson);
        set({ user, isAuthenticated: true, error: null });
      }
    } catch (error) {
      set({ error: `Failed to load session: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  // Sign in with email and password
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call - in real app, connect to backend
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }

      // Create a user object (in real app, get from API)
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        fullName: email.split("@")[0],
      };

      // Save to storage
      await storage.setItem("auth_user", JSON.stringify(user));

      set({ user, isAuthenticated: true, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ error: errorMessage, isAuthenticated: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Sign up with full name, email, and password
  signup: async (fullName: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Validate inputs
      if (!fullName || !email || !password) {
        throw new Error("All fields are required");
      }

      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Create a user object (in real app, post to API)
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        fullName,
      };

      // Save to storage
      await storage.setItem("auth_user", JSON.stringify(user));

      set({ user, isAuthenticated: true, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ error: errorMessage, isAuthenticated: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Log out user
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await storage.removeItem("auth_user");
      set({ user: null, isAuthenticated: false, error: null });
    } catch (error) {
      set({ error: `Failed to logout: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },
}));
