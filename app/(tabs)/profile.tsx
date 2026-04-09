import Header from "@/components/Header";
import { getTheme } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { customAlert } from "@/store/alertStore";
import { useAuthStore } from "@/store/authStore";
import { useTransactionStore } from "@/store/transactionStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "preview" | "edit";

export default function ProfileScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const themeMode = useThemeStore((state) => state.mode);
  const currency = useThemeStore((state) => state.currency);
  const setThemeMode = useThemeStore((state) => state.setTheme);
  const setCurrency = useThemeStore((state) => state.setCurrency);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
    const transactions = useTransactionStore((state) => state.transactions);
    
    const totalSpendings = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = totalIncome - totalSpendings;

  const theme = getTheme(themeMode);
  const isDark = themeMode === "dark";

  const [activeTab, setActiveTab] = useState<TabType>("preview");

  // Edit form state
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── colours that work in both themes ──────────────────────────────────────
  const bg = isDark ? "#0A0A0A" : "#F2F2F7";
  const surface = isDark ? "#1C1C1E" : "#FFFFFF";
  const surfaceBorder = isDark ? "#2C2C2E" : "#E5E5EA";
  const textPrimary = isDark ? "#FFFFFF" : "#000000";
  const textSecondary = isDark ? "#8E8E93" : "#6C6C70";
  const inputBg = isDark ? "#2C2C2E" : "#F2F2F7";
  const tabActiveBg = isDark ? "#FFFFFF" : "#FFFFFF";
  const tabActiveText = isDark ? "#000000" : "#000000";
  const tabInactiveText = isDark ? "#8E8E93" : "#8E8E93";
  const tabContainerBg = isDark ? "#2C2C2E" : "#E5E5EA";
  const divider = isDark ? "#2C2C2E" : "#E5E5EA";

  const handleThemeToggle = (value: boolean) => {
    haptics.mediumTap();
    setThemeMode(value ? "dark" : "light").catch((error) => {
      console.error("Failed to save theme:", error);
      customAlert("Error", "Failed to save theme preference");
    });
  };

  const handleUpdateDetails = () => {
    haptics.mediumTap();
    if (password && password !== confirmPassword) {
      customAlert("Error", "Passwords did not match");
      return;
    }
    // TODO: wire up to your auth store / API
    customAlert("Success", "Details updated successfully");
//     // TODO: Actually wire up to API and swap this alert
  };

  const handleLogout = () => {
    haptics.warning();
    customAlert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel", onPress: () => {} },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Failed to logout:", error);
            customAlert("Error", "Logout failed, but proceeding to sign-in.");
          } finally {
            router.replace("/sign-in");
          }
        },
      },
    ]);
  };

  // ── shared card style ──────────────────────────────────────────────────────
  const card = {
    backgroundColor: surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: surfaceBorder,
  };

  // ── input style ────────────────────────────────────────────────────────────
  const inputStyle = {
    backgroundColor: inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: textPrimary,
    borderWidth: 1,
    borderColor: surfaceBorder,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Header row ─────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 5,
            paddingBottom: 12,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: isDark ? "#ffffff" : "#0a0a0a",
              borderWidth: 1,
              borderColor: surfaceBorder,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: isDark ? "#0a0a0a" : "#ffffff",
              }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>

          <Text style={{ fontSize: 17, fontWeight: "600", color: textPrimary }}>
            {user?.fullName
              ? user.fullName
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1).toLowerCase(),
                  )
                  .join(" ")
              : "Unknown User"}
          </Text>
        </View>

        {/* ── Preview / Edit Tab Switcher ─────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: tabContainerBg,
              borderRadius: 25,
              padding: 3,
            }}
          >
            {(["preview", "edit"] as TabType[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => {
                    haptics.lightTap();
                    setActiveTab(tab);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 25,
                    alignItems: "center",
                    backgroundColor: isActive ? tabActiveBg : "transparent",
                    shadowColor: isActive ? (isDark ? "#FFFFFF" : "#000") : "transparent",
                    shadowOpacity: isActive ? (isDark ? 0.05 : 0.1) : 0,
                    shadowOffset: { width: 0, height: 1 },
                    shadowRadius: 2,
                    elevation: isActive ? 2 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: isActive ? tabActiveText : tabInactiveText,
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── PREVIEW TAB ─────────────────────────────────────────────────── */}
        {activeTab === "preview" && (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {/* Stats */}
            {[
              { label: "Total spendings", value: formatCurrency(totalSpendings, { currencySymbol: currency }) },
              { label: "Email", value: user?.email ?? "rahulkumarkeshri475@gmail.com" },
              { label: "Balance", value: formatCurrency(balance, { currencySymbol: currency }) },
            ].map((item, idx, arr) => (
              <View key={item.label}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontSize: 15, color: textSecondary }}>
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: textPrimary,
                    }}
                  >
                    {item.value}
                  </Text>
                </View>
                {idx < arr.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: divider,
                      marginTop: 4,
                    }}
                  />
                )}
              </View>
            ))}

            {/* Appearance */}
            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  marginBottom: 8,
                }}
              >
                Appearance
              </Text>
              <View
                style={{
                  ...card,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 13,
                  paddingHorizontal: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: textPrimary,
                    }}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: textSecondary, marginTop: 2 }}
                  >
                    {isDark ? "Enabled" : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: "#3A3A3C", true: "#48484A" }}
                  thumbColor={isDark ? "#FFFFFF" : "#FFFFFF"}
                />
              </View>
            </View>

            {/* Logout */}
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({
                marginTop: 16,
                backgroundColor: isDark ? "#FFFFFF" : "#000000",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isDark ? "#000000" : "#FFFFFF",
                }}
              >
                Logout
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── EDIT TAB ────────────────────────────────────────────────────── */}
        {activeTab === "edit" && (
          <View style={{ paddingHorizontal: 16, gap: 16 }}>
            {/* Full Name */}
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: textPrimary }}
              >
                Full Name
              </Text>
              <TextInput
                style={inputStyle}
                placeholder="Enter your full name"
                placeholderTextColor={textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email */}
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: textPrimary }}
              >
                Email
              </Text>
              <TextInput
                style={inputStyle}
                placeholder="Enter your email"
                placeholderTextColor={textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: textPrimary }}
              >
                Password
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={inputStyle}
                  placeholder="Create a password"
                  placeholderTextColor={textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  {({ pressed }) => (
                    <Ionicons
                      name={
                        showPassword
                          ? pressed
                            ? "eye-off-sharp"
                            : "eye-off-outline"
                          : pressed
                            ? "eye-sharp"
                            : "eye-outline"
                      }
                      size={20}
                      color="#9ca3af"
                    />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: textPrimary }}
              >
                Confirm Password
              </Text>
              <TextInput
                style={inputStyle}
                placeholder="Confirm your password"
                placeholderTextColor={textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* Update Button */}
            <Pressable
              onPress={handleUpdateDetails}
              style={({ pressed }) => ({
                marginTop: 4,
                backgroundColor: isDark ? "#FFFFFF" : "#000000",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isDark ? "#000000" : "#FFFFFF",
                }}
              >
                Update Details
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        onPress={() => {
          haptics.mediumTap();
          router.push("/add-transaction");
        }}
        style={({ pressed }) => ({
          position: "absolute",
          bottom: theme.spacing["2xl"],
          right: theme.spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isDark ? "#ffffff" : "#000000",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: isDark ? "#FFFFFF" : "#000",
            shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.1 : 0.3,
          shadowRadius: 8,
          elevation: 8,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        })}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "300",
            color: isDark ? "#000000" : "#ffffff",
            lineHeight: 30,
          }}
        >
          +
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
