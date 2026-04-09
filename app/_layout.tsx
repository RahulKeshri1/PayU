import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import CustomAlert from "@/components/CustomAlert";
import { getTheme } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useThemeStore } from "@/store/themeStore";
import { useTransactionStore } from "@/store/transactionStore";
import { LogBox } from "react-native";

// Ignore expected warnings from traditional native modules running on the New Architecture (Fabric)
LogBox.ignoreLogs([
  "setLayoutAnimationEnabledExperimental is currently a no-op",
]);

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  // Load all stores on app start
  const { mode: themeMode, loadTheme } = useThemeStore();
  const { loadTransactions } = useTransactionStore();
  const { loadCategories } = useCategoryStore();
  const { isAuthenticated, loadSession } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  const router = useRouter();
  const navigationInitializedRef = useRef(false);
  const theme = getTheme(themeMode);

  useEffect(() => {
    // Initialize all stores from AsyncStorage
    const initializeApp = async () => {
      try {
        // Load stores sequentially to avoid race conditions
        await loadTheme();
        await loadSession();
        await loadTransactions();
        await loadCategories();
      } catch (error) {
        console.error("Error initializing app stores:", error);
      } finally {
        // Always mark as ready
        setAppReady(true);
      }
    };
    initializeApp();
  }, [loadTheme, loadSession, loadTransactions, loadCategories]);

  // Handle initial navigation only once, after everything is mounted
  useEffect(() => {
    if (!appReady || navigationInitializedRef.current) return;
    navigationInitializedRef.current = true;

    // Use setTimeout to ensure all rendering is complete before navigating
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/sign-in");
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [appReady, isAuthenticated, router]);

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />

        {/* Main navigation screens */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        {/* Modals - Always available */}
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />

        {/* Edit Transaction Modal */}
        <Stack.Screen
          name="edit-transaction"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
      </Stack>

      {/* Status bar style based on theme */}
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <CustomAlert />
    </GestureHandlerRootView>
  );
}
