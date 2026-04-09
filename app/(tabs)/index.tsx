import Header from "@/components/Header";
import { getTheme } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useThemeStore } from "@/store/themeStore";
import { useTransactionStore } from "@/store/transactionStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type ExpensePeriod = "weekly" | "monthly";

export default function HomeScreen() {
  const haptics = useHapticFeedback();
  const router = useRouter();

  const themeMode = useThemeStore((state) => state.mode);
  const currency = useThemeStore((state) => state.currency);
  const theme = getTheme(themeMode);

  const isDark = themeMode === "dark";

  const transactions = useTransactionStore((state) => state.transactions);
  const getMonthlyStats = useTransactionStore((state) => state.getMonthlyStats);
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);
  const user = useAuthStore((state) => state.user);

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [expensePeriod, setExpensePeriod] = useState<ExpensePeriod>("weekly");

  const monthlyStats = getMonthlyStats(month, year);

  const cardScale = useSharedValue(0.92);
  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 120 });
  }, [cardScale]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 5),
    [transactions],
  );

  // Group expenses by category for the expense list with past period comparisons
  const expensesByCategory = useMemo(() => {
    const map: Record<
      string,
      { total: number; pastTotal: number; count: number; category: any }
    > = {};

    const now = new Date();
    const periodStart = new Date(now);
    const pastPeriodStart = new Date(now);

    if (expensePeriod === "weekly") {
      periodStart.setDate(now.getDate() - 7);
      pastPeriodStart.setDate(periodStart.getDate() - 7);
    } else {
      periodStart.setMonth(now.getMonth() - 1);
      pastPeriodStart.setMonth(periodStart.getMonth() - 1);
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.timestamp);
      const isCurrentPeriod = tDate >= periodStart && tDate <= now;
      const isPastPeriod = tDate >= pastPeriodStart && tDate < periodStart;

      if (isCurrentPeriod || isPastPeriod) {
        if (!map[t.category]) {
          map[t.category] = {
            total: 0,
            pastTotal: 0,
            count: 0,
            category: getCategoryById(t.category),
          };
        }
        
        if (isCurrentPeriod) {
          map[t.category].total += t.amount;
          map[t.category].count += 1;
        } else if (isPastPeriod) {
          map[t.category].pastTotal += t.amount;
        }
      }
    });

    return Object.entries(map)
      .map(([id, val]) => ({ id, ...val }))
      .filter((v) => v.total > 0) // Only show categories that have current spend
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions, getCategoryById, expensePeriod]);

  const handleAddTransaction = () => {
    haptics.mediumTap();
    router.push("/add-transaction");
  };

  const rawFirstName = user?.fullName?.trim().split(" ")[0];
  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
    : "Rahul";

  // Theme-aware colors
  const cardBg = isDark ? "#1c1c1e" : "#f0f0f0";
  const cardBorder = isDark ? "transparent" : "#e0e0e0";
  const rowBg = isDark ? "#1A1C1A" : "#f5f5f5";
  const amountBadgeBg = isDark ? "#2A2A2A" : "#e8e8e8";
  const tabBg = isDark ? "#1c1c1e" : "#e8e8e8";
  const iconCircleBg = isDark ? "#FFFFFF" : "#d8d8d8";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Header />

        {/* ── Greeting ── */}
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: 4,
            }}
          >
            Hey, {firstName}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            Add your yesterday's expense
          </Text>
        </View>

        {/* ── Gradient Card ── */}
        <Animated.View
          style={[
            {
              marginHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing["2xl"],
              borderRadius: 20,
              overflow: "hidden",
            },
            cardAnimatedStyle,
          ]}
        >
          <LinearGradient
            colors={["#f5c89a", "#a8d8b0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: theme.spacing.lg,
              borderRadius: 20,
              minHeight: 180,
              justifyContent: "space-between",
            }}
          >
            {/* Top Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "rgba(0,0,0,0.75)",
                }}
              >
                ADRBank
              </Text>
              {/* Chip icon */}
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(0,0,0,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18 }}>💳</Text>
              </View>
            </View>

            {/* Card Number */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "rgba(0,0,0,0.8)",
                letterSpacing: 2,
                marginBottom: theme.spacing.xl,
              }}
            >
              8763 1111 2222 0329
            </Text>

            {/* Bottom Row */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(0,0,0,0.55)",
                    marginBottom: 2,
                  }}
                >
                  Card Holder Name
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "rgba(0,0,0,0.8)",
                  }}
                >
                  {firstName}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(0,0,0,0.55)",
                    marginBottom: 2,
                  }}
                >
                  Expired Date
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "rgba(0,0,0,0.8)",
                  }}
                >
                  10/28
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Your Transactions ── */}
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: theme.spacing.lg,
            }}
          >
            Your transactions
          </Text>

          {/* Weekly / Monthly Toggle */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: tabBg,
              borderRadius: 50,
              padding: 4,
              marginBottom: theme.spacing.lg,
            }}
          >
            {(["weekly", "monthly"] as ExpensePeriod[]).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => {
                  haptics.lightTap();
                  setExpensePeriod(tab);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: "center",
                  borderRadius: 50,
                  backgroundColor:
                    expensePeriod === tab
                      ? isDark
                        ? "#ffffff"
                        : "#0a0a0a"
                      : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      expensePeriod === tab
                        ? isDark
                          ? "#0a0a0a"
                          : "#ffffff"
                        : theme.colors.textSecondary,
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Expense Category Rows */}
          {expensesByCategory.length === 0 ? (
            <View
              style={{
                padding: theme.spacing.xl,
                backgroundColor: rowBg,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                No transactions yet
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginTop: theme.spacing.sm,
                }}
              >
                Tap + to add your first transaction
              </Text>
            </View>
          ) : (
            expensesByCategory.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  haptics.lightTap();
                  router.push("/transactions");
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: rowBg,
                  borderRadius: 16,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.sm,
                  opacity: pressed ? 0.8 : 1,
                  shadowColor: isDark ? "transparent" : "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0 : 0.05,
                  shadowRadius: 8,
                  elevation: isDark ? 0 : 2,
                })}
              >
                {/* Category Icon */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isDark
                      ? "#FFFFFF"
                      : (item.category?.color ?? iconCircleBg),
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: theme.spacing.md,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>
                    {item.category?.emoji ?? "📌"}
                  </Text>
                </View>

                {/* Label */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.colors.text,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {item.category?.name ?? "Other"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                      {(() => {
                        const periodStr =
                          expensePeriod === "weekly"
                            ? "last week"
                            : "last month";
                        if (!item.pastTotal) return `No data from ${periodStr}`;

                        const diff = item.total - item.pastTotal;
                        if (diff === 0) return `Same as ${periodStr}`;

                        const percent = Math.abs(
                          (diff / item.pastTotal) * 100,
                        ).toFixed(0);
                        return diff > 0
                          ? `${percent}% more than ${periodStr}`
                          : `${percent}% less than ${periodStr}`;
                      })()}
                    </Text>
                  </View>

                  {/* Amount Badge */}
                  <View
                    style={{
                    backgroundColor: amountBadgeBg,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: theme.colors.text,
                    }}
                  >
                    {formatCurrency(item.total, { currencySymbol: currency })}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        onPress={handleAddTransaction}
        style={({ pressed }) => ({
          position: "absolute",
          bottom: theme.spacing["2xl"],
          right: theme.spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isDark ? "#ffffff" : "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
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
            color: isDark ? "#0a0a0a" : "#ffffff",
            lineHeight: 30,
          }}
        >
          +
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
