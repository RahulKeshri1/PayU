// Design Tokens for PayU Finance App
// Black & White minimalist design with accent colors

import { Platform } from "react-native";

export const Colors = {
  // Semantic Accent Colors (better contrast in both modes)
  income: "#10B981", // Green - visible in both light and dark
  expense: "#EF4444", // Red - visible in both light and dark

  // Grayscale Category Colors
  categories: {
    food: "#F87171",
    transport: "#60A5FA",
    shopping: "#A78BFA",
    health: "#34D399",
    entertainment: "#FBBF24",
    salary: "#10B981",
    freelance: "#8B5CF6",
    investment: "#0EA5E9",
    rent: "#F97316",
    others: "#6B7280",
  },

  // Dark Mode - Black & White Theme with proper contrast
  dark: {
    background: "#000000", // Pure black
    surface: "#1A1A1A", // Dark gray - high contrast with white text
    surfaceHover: "#262626", // Slightly lighter
    text: "#F5F5F5", // Almost white for readability
    textSecondary: "#A0A0A0", // Medium gray
    border: "#404040", // Visible border
    card: "#1A1A1A", // Dark gray card
    disabled: "#4B5563", // Disabled state
    tint: "#F5F5F5", // Almost white
    icon: "#F5F5F5", // Almost white
    tabIconDefault: "#808080", // Gray inactive
    tabIconSelected: "#10B981", // Green active
  },

  // Light Mode with proper contrast
  light: {
    background: "#FAFAFA", // Very light gray (not pure white)
    surface: "#FFFFFF", // White surface
    surfaceHover: "#F3F4F6", // Light gray hover
    text: "#1F2937", // Dark gray (not pure black for readability)
    textSecondary: "#6B7280", // Medium gray
    border: "#E5E7EB", // Light border
    card: "#FFFFFF", // White card
    disabled: "#9CA3AF", // Disabled state
    tint: "#1F2937", // Dark icon
    icon: "#1F2937", // Dark icon
    tabIconDefault: "#9CA3AF", // Gray inactive
    tabIconSelected: "#059669", // Darker green active
  },

  // Semantic tokens
  shadow: "#000000",
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  pill: 100,
};

export const Typography = {
  // 36px, FontWeight 700
  balanceAmount: {
    fontSize: 36,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },

  // 18px, FontWeight 600
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },

  // 15px, FontWeight 600
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600" as const,
  },

  // 13px, FontWeight 400
  body: {
    fontSize: 13,
    fontWeight: "400" as const,
  },

  // 11px, FontWeight 400
  caption: {
    fontSize: 11,
    fontWeight: "400" as const,
  },

  // Additional variants
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
  },

  label: {
    fontSize: 13,
    fontWeight: "500" as const,
  },

  tabLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
};

export const Elevation = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  floating: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },

  pressed: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Animation = {
  // Spring configuration for all animations
  spring: {
    damping: 18,
    stiffness: 200,
    mass: 0.8,
  },
};

export const Opacity = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.7,
};

// Theme variant for light/dark mode
export type ThemeMode = "light" | "dark";

export interface Theme {
  mode: ThemeMode;
  colors: (typeof Colors.light | typeof Colors.dark) & {
    income: string;
    expense: string;
  };
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  typography: typeof Typography;
  elevation: typeof Elevation;
  animation: typeof Animation;
  opacity: typeof Opacity;
  categoryColors: typeof Colors.categories;
  gradientPrimary: { start: string; end: string };
}

export const getTheme = (mode: ThemeMode): Theme => {
  const shadowColor = mode === "dark" ? "#FFFFFF" : "#000000";
  const dynamicElevation = {
    card: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: mode === "dark" ? 0.05 : 0.12,
      shadowRadius: 16,
      elevation: mode === "dark" ? 4 : 8,
    },
    floating: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: mode === "dark" ? 0.1 : 0.16,
      shadowRadius: 24,
      elevation: mode === "dark" ? 6 : 12,
    },
    pressed: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: mode === "dark" ? 0.03 : 0.08,
      shadowRadius: 8,
      elevation: mode === "dark" ? 2 : 4,
    },
  };
  const gradients = {
    light: {
      start: "#F3F4F6", // Light gray start
      end: "#E5E7EB", // Medium light gray end - subtle gradient
    },
    dark: {
      start: "#262626", // Slightly lighter than surface
      end: "#1A1A1A", // Back to surface color
    },
  };

  return {
    mode,
    colors: {
      ...(mode === "light" ? Colors.light : Colors.dark),
      income: Colors.income,
      expense: Colors.expense,
    },
    spacing: Spacing,
    borderRadius: BorderRadius,
    typography: Typography,
    elevation: dynamicElevation,
    animation: Animation,
    opacity: Opacity,
    categoryColors: Colors.categories,
    gradientPrimary: mode === "light" ? gradients.light : gradients.dark,
  };
};
