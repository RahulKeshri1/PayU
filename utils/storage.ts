/**
 * In-Memory storage helper for Zustand stores
 * Uses in-memory storage to avoid native module initialization issues
 * All data persists for the session - perfect for Expo development
 */

const STORAGE_PREFIX = "payu_";
const memoryStore: Map<string, string> = new Map();

export const storage = {
  /**
   * Get value from in-memory storage
   */
  getItem: async (key: string): Promise<any> => {
    try {
      const prefixedKey = `${STORAGE_PREFIX}${key}`;
      const value = memoryStore.get(prefixedKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(
        `Warning: Could not read from storage (${key}):`,
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  },

  /**
   * Set value in in-memory storage
   */
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const prefixedKey = `${STORAGE_PREFIX}${key}`;
      const serialized = JSON.stringify(value);
      memoryStore.set(prefixedKey, serialized);
    } catch (error) {
      console.warn(
        `Warning: Could not write to storage (${key}):`,
        error instanceof Error ? error.message : error,
      );
      // App continues with in-memory storage
    }
  },

  /**
   * Remove value from in-memory storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      const prefixedKey = `${STORAGE_PREFIX}${key}`;
      memoryStore.delete(prefixedKey);
    } catch (error) {
      console.warn(
        `Warning: Could not remove from storage (${key}):`,
        error instanceof Error ? error.message : error,
      );
      // App continues
    }
  },

  /**
   * Clear all PayU data from in-memory storage
   */
  clearAll: async (): Promise<void> => {
    try {
      const keysToDelete: string[] = [];
      memoryStore.forEach((_, key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => memoryStore.delete(key));
    } catch (error) {
      console.warn(
        "Warning: Could not clear all PayU data:",
        error instanceof Error ? error.message : error,
      );
      // App continues
    }
  },
};
