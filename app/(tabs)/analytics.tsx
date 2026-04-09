import Header from "@/components/Header";
import { getTheme } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { useCategoryStore } from "@/store/categoryStore";
import { useThemeStore } from "@/store/themeStore";
import { useTransactionStore } from "@/store/transactionStore";
import { getMonthLabel, navigateMonth } from "@/utils/dateHelpers";
import { formatCurrency } from "@/utils/formatCurrency";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ExpenseCategory {
  x: string;
  y: number;
  color: string;
}

interface DailyData {
  x: string;
  income: number;
  expense: number;
}

// ── Gradient Bar Chart ────────────────────────────────────────────────────────
function GradientBarChart({
  data,
  isDark,
  currency,
}: {
  data: DailyData[];
  isDark: boolean;
  currency: string;
}) {
  const gridColor = isDark ? "#2C2C2E" : "#E5E5EA";
  const labelColor = isDark ? "#636366" : "#8E8E93";

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const gridLines = Array.from(
    new Set([0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(p * maxVal))),
  );

  const BAR_W = 14;
  const GAP = 6;
  const GROUP_W = BAR_W * 2 + GAP + 16;
  const CHART_H = 140;

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row" }}>
        {/* Y-axis labels */}
        <View
          style={{
            width: 40,
            height: CHART_H,
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingRight: 6,
          }}
        >
          {[...gridLines].reverse().map((v) => (
            <Text
              key={v}
              style={{ fontSize: 9, color: labelColor }}
            >{`${currency}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}</Text>
          ))}
        </View>

        {/* Bars + grid + X-axis labels */}
        <View style={{ flex: 1 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: 9999, y: 0 }}
          >
            <View>
              <View
                style={{
                  position: "relative",
                  height: CHART_H,
                  width: data.length * GROUP_W + (data.length - 1) * 4,
                }}
              >
                {/* Grid lines */}
                {gridLines.map((v) => (
                  <View
                    key={v}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: (v / maxVal) * CHART_H,
                      height: 1,
                      backgroundColor: gridColor,
                    }}
                  />
                ))}

                {/* Bar groups */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    height: CHART_H,
                    gap: 4,
                  }}
                >
                  {data.map((d, i) => {
                    const incH = Math.max((d.income / maxVal) * CHART_H, 2);
                    const expH = Math.max((d.expense / maxVal) * CHART_H, 2);
                    return (
                      <View
                        key={i}
                        style={{
                          width: GROUP_W,
                          alignItems: "flex-end",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: GAP,
                          paddingHorizontal: 4,
                        }}
                      >
                        {/* Income bar */}
                        <LinearGradient
                          colors={["#34D399", "#065F46"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={{
                            width: BAR_W,
                            height: incH,
                            borderRadius: 4,
                          }}
                        />
                        {/* Expense bar */}
                        <LinearGradient
                          colors={["#F87171", "#7F1D1D"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={{
                            width: BAR_W,
                            height: expH,
                            borderRadius: 4,
                          }}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* X-axis labels */}
              <View style={{ flexDirection: "row", gap: 4 }}>
                {data.map((d, i) => (
                  <View
                    key={i}
                    style={{ width: GROUP_W, alignItems: "center" }}
                  >
                    <Text
                      style={{ fontSize: 10, color: labelColor, marginTop: 4 }}
                    >
                      {d.x}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          marginTop: 10,
          marginLeft: 40,
        }}
      >
        {[
          { label: "Income", color: "#34D399" },
          { label: "Expense", color: "#F87171" },
        ].map((l) => (
          <View
            key={l.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: l.color,
              }}
            />
            <Text style={{ fontSize: 11, color: labelColor }}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const haptics = useHapticFeedback();
  const router = useRouter();

  const themeMode = useThemeStore((state) => state.mode);
  const currency = useThemeStore((state) => state.currency);
  const theme = getTheme(themeMode);
  const isDark = themeMode === "dark";

  const getMonthlyStats = useTransactionStore((state) => state.getMonthlyStats);
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);
  const transactions = useTransactionStore((state) => state.transactions);

  const [now] = useState(() => new Date());
    const [month, setMonth] = useState(() => now.getMonth() + 1);
    const [year, setYear] = useState(() => now.getFullYear());

  const stats = getMonthlyStats(month, year);

  const handlePrevMonth = () => {
    const u = navigateMonth(month, year, "prev");
    setMonth(u.month);
    setYear(u.year);
  };
  const handleNextMonth = () => {
    const u = navigateMonth(month, year, "next");
    setMonth(u.month);
    setYear(u.year);
  };

  const expensesByCategory: ExpenseCategory[] = Object.entries(
    stats.categoryBreakdown,
  )
    .filter(([id, v]) => {
      const cat = getCategoryById(id);
      return v.amount > 0 && cat?.type === "expense";
    })
    .map(([id, v]) => {
      const cat = getCategoryById(id);
      return {
        x: cat ? cat.name : id,
        y: v.amount,
        color: cat ? cat.color : theme.colors.border,
      };
    })
    .sort((a, b) => b.y - a.y);

  // Format date in YYYY-MM-DD using local time
    const formatDateLocal = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // Calculate DailyData for the entire selected month to allow horizontal gliding
    const dailyDataMap: Record<string, { income: number; expense: number }> = {};

    // Always show the whole month.
    const referenceDate = new Date(year, month, 0); // Last day of the selected month
    referenceDate.setHours(12, 0, 0, 0);

    const daysToMap = referenceDate.getDate(); // Number of days up to the reference date
    for (let i = daysToMap - 1; i >= 0; i--) {
      const d = new Date(referenceDate.getTime());
      d.setDate(d.getDate() - i);
      const dateStr = formatDateLocal(d);
      dailyDataMap[dateStr] = { income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const d = new Date(t.timestamp);
      const txMonth = d.getMonth() + 1;
      const txYear = d.getFullYear();

      // Only process transactions belonging to the selected month/year
      if (txMonth !== month || txYear !== year) return;

      const dateStr = formatDateLocal(d);
      if (dailyDataMap[dateStr]) {
        if (t.type === "income") dailyDataMap[dateStr].income += t.amount;
        if (t.type === "expense") dailyDataMap[dateStr].expense += t.amount;
      }
    });

    const chartData: DailyData[] = Object.entries(dailyDataMap).map(
    ([iso, v]) => ({
      x: parseInt(iso.split("-")[2], 10).toString(),
      income: v.income,
      expense: v.expense,
    }),
  );

  const savings = stats.income - stats.expense;
  const savingsRate = stats.income > 0 ? (savings / stats.income) * 100 : 0;

  // ── theme tokens ────────────────────────────────────────────────────────────
  const bg = isDark ? "#0A0A0A" : "#F2F2F7";
  const surface = isDark ? "#1C1C1E" : "#FFFFFF";
  const surfaceBorder = isDark ? "#2C2C2E" : "#E5E5EA";
  const textPrimary = isDark ? "#FFFFFF" : "#000000";
  const textSecondary = isDark ? "#8E8E93" : "#6C6C70";
  const divider = isDark ? "#2C2C2E" : "#E5E5EA";

  const card = {
    backgroundColor: surface,
    borderRadius: 14,
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
        {/* Month Navigator */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <Pressable onPress={handlePrevMonth} hitSlop={12}>
            <Text style={{ fontSize: 20, color: textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 15, fontWeight: "600", color: textPrimary }}>
            {`${getMonthLabel(month, year, false)} ${year}`}
          </Text>
          <Pressable onPress={handleNextMonth} hitSlop={12}>
            <Text style={{ fontSize: 20, color: textPrimary }}>→</Text>
          </Pressable>
        </View>

        {/* Income / Expense Cards */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
        >
          {[
            {
              label: "Income",
              value: stats.income,
              color: "#34D399",
            },
            {
              label: "Expense",
              value: stats.expense,
              color: "#F87171",
            },
          ].map((item) => (
            <View key={item.label} style={{ ...card, flex: 1, padding: 14 }}>
              <Text style={{ fontSize: 12, color: textSecondary }}>
                {item.label}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: item.color,
                  marginTop: 4,
                }}
              >
                {formatCurrency(item.value, { currencySymbol: currency })}
              </Text>
            </View>
          ))}
        </View>

        {/* Net Savings */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ ...card, padding: 16 }}>
            <Text style={{ fontSize: 12, color: textSecondary }}>
              Net Savings
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: savings >= 0 ? "#34D399" : "#F87171",
                marginTop: 6,
              }}
            >
              {formatCurrency(savings, { currencySymbol: currency })}
            </Text>
            <Text style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>
              Savings rate: {savingsRate.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Bar Chart */}
        {chartData.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                paddingHorizontal: 16,
                marginBottom: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: textPrimary,
                }}
              >
                Income & Expense
              </Text>
              <Text style={{ fontSize: 12, color: textSecondary }}>
                {month === now.getMonth() + 1 && year === now.getFullYear() ? "Current Month" : new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" })}
              </Text>
            </View>
            <View
              style={{ ...card, marginHorizontal: 16, paddingVertical: 16 }}
            >
              <GradientBarChart
                data={chartData}
                isDark={isDark}
                currency={currency}
              />
            </View>
          </View>
        )}

        {/* Expenses by Category */}
        {expensesByCategory.length > 0 ? (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: textPrimary,
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              Expenses by Category
            </Text>
            <View style={{ ...card, marginHorizontal: 16 }}>
              {expensesByCategory.map((cat, idx) => {
                const pct =
                  stats.expense > 0
                    ? ((cat.y / stats.expense) * 100).toFixed(1)
                    : "0";
                return (
                  <View key={cat.x}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 13,
                        paddingHorizontal: 16,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: cat.color,
                            marginRight: 10,
                          }}
                        />
                        <Text style={{ fontSize: 14, color: textPrimary }}>
                          {cat.x}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#F87171",
                          }}
                        >
                          {formatCurrency(cat.y, { currencySymbol: currency })}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: textSecondary,
                            marginTop: 1,
                          }}
                        >
                          {pct}%
                        </Text>
                      </View>
                    </View>
                    {idx < expensesByCategory.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: divider,
                          marginHorizontal: 16,
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View
            style={{
              ...card,
              marginHorizontal: 16,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: textSecondary }}>
              No expense data this month
            </Text>
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
