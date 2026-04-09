import { getTheme } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export default function Header() {
  const haptics = useHapticFeedback();
  const themeMode = useThemeStore((state) => state.mode);
  const theme = getTheme(themeMode);
  const isDark = themeMode === "dark";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginBottom: 10,
      }}
    >
      {/* Logo + App Name */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            backgroundColor: isDark ? "#ffffff" : "#0a0a0a",
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: isDark ? "#0a0a0a" : "#ffffff",
            }}
          >
            P
          </Text>
        </View>
        <Text
          style={{
            ...theme.typography.title,
            fontSize: 18,
            fontWeight: "700",
            color: theme.colors.text,
          }}
        >
          PayU
        </Text>
      </View>

      {/* Icons */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Pressable onPress={() => haptics.lightTap()} style={{ padding: 4 }}>
          {({ pressed }) => (
            <Ionicons
              name={pressed ? "search-sharp" : "search-outline"}
              size={24}
              color={theme.colors.text}
            />
          )}
        </Pressable>

        <Pressable
          onPress={() => haptics.lightTap()}
          style={{ padding: 4, position: "relative" }}
        >
          {({ pressed }) => (
            <>
              <Ionicons
                name={pressed ? "notifications-sharp" : "notifications-outline"}
                size={24}
                color={theme.colors.text}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: "#ef4444",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 9, fontWeight: "700", color: "#ffffff" }}
                >
                  2
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
