import Header from "@/components/Header";
import { getTheme } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { customAlert } from "@/store/alertStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useThemeStore } from "@/store/themeStore";
import { useTransactionStore } from "@/store/transactionStore";
import { Transaction } from "@/types";
import { getDateLabel } from "@/utils/dateHelpers";
import { formatCurrency } from "@/utils/formatCurrency";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "income" | "expense";

interface GroupedTransaction {
  date: string;
  label: string;
  transactions: Transaction[];
}

interface UndoState {
  transaction: Transaction;
}

export default function TransactionsScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const themeMode = useThemeStore((state) => state.mode);
  const currency = useThemeStore((state) => state.currency);
  const theme = getTheme(themeMode);
  const isDark = themeMode === "dark";

  const transactions = useTransactionStore((state) => state.transactions);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const restoreTransaction = useTransactionStore((s) => s.restoreTransaction);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const filtered = transactions
    .filter((txn) => filterType === "all" || txn.type === filterType)
    .filter((txn) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const cat = getCategoryById(txn.category);
      return (
        txn.title.toLowerCase().includes(q) ||
        (txn.note?.toLowerCase().includes(q) ?? false) ||
        (cat?.name.toLowerCase().includes(q) ?? false)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const groupedMap = new Map<string, GroupedTransaction>();
  for (const txn of filtered) {
    if (!groupedMap.has(txn.date)) {
      groupedMap.set(txn.date, {
        date: txn.date,
        label: getDateLabel(txn.timestamp),
        transactions: [],
      });
    }
    groupedMap.get(txn.date)?.transactions.push(txn);
  }

  const grouped = Array.from(groupedMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const scheduleUndoExpiry = () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => setUndoState(null), 3000);
  };

  const handleDelete = async (txn: Transaction) => {
    try {
      await deleteTransaction(txn.id);
      haptics.warning();
      setUndoState({ transaction: txn });
      scheduleUndoExpiry();
    } catch {
      customAlert("Error", "Failed to delete transaction.");
    }
  };

  const handleUndo = async () => {
    if (!undoState) return;
    try {
      await restoreTransaction(undoState.transaction);
      haptics.success();
      setUndoState(null);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    } catch {
      customAlert("Error", "Failed to restore transaction.");
    }
  };

  // ── theme tokens ──────────────────────────────────────────────────────────
  const bg = isDark ? "#0A0A0A" : "#F2F2F7";
  const surface = isDark ? "#1C1C1E" : "#FFFFFF";
  const surfaceBorder = isDark ? "#2C2C2E" : "#E5E5EA";
  const textPrimary = isDark ? "#FFFFFF" : "#000000";
  const textSecondary = isDark ? "#8E8E93" : "#6C6C70";
  const divider = isDark ? "#2C2C2E" : "#E5E5EA";
  const inputBg = isDark ? "#1C1C1E" : "#FFFFFF";
  const tabContainerBg = isDark ? "#2C2C2E" : "#E5E5EA";

  const rowBg = isDark ? "#1A1C1A" : "#f5f5f5";
  const amountBadgeBg = isDark ? "#2A2A2A" : "#e8e8e8";
  const iconCircleBg = isDark ? "#FFFFFF" : "#d8d8d8";

  // ── Transaction Row ───────────────────────────────────────────────────────
  const renderTransactionRow = (txn: Transaction) => {
    const category = getCategoryById(txn.category);
    const isIncome = txn.type === "income";

    return (
      <Pressable
        key={txn.id}
        onPress={() => {
          haptics.lightTap();
          router.push({
            pathname: "/edit-transaction",
            params: { id: txn.id },
          });
        }}
        onLongPress={() => {
          customAlert("Delete Transaction?", "", [
            { text: "Cancel", style: "cancel", onPress: () => undefined },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                handleDelete(txn).catch(() => undefined);
              },
            },
          ]);
        }}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: rowBg,
          borderRadius: 16,
          padding: 16,
          marginBottom: 8,
          opacity: pressed ? 0.8 : 1,
          shadowColor: isDark ? "transparent" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 8,
          elevation: isDark ? 0 : 2,
        })}
      >
        {/* Category icon bubble */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: isDark
              ? "#FFFFFF"
              : (category?.color ?? iconCircleBg),
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}
        >
          <Text style={{ fontSize: 20 }}>{category?.emoji ?? "📌"}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: textPrimary,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
            numberOfLines={1}
          >
            {category?.name ?? "Uncategorized"}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: textSecondary,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {txn.title}
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
              color: isIncome ? "#34D399" : textPrimary,
            }}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(txn.amount, { currencySymbol: currency })}
          </Text>
        </View>
      </Pressable>
    );
  };

  // ── Date Group ────────────────────────────────────────────────────────────
  const renderDateGroup = ({ item }: { item: GroupedTransaction }) => (
    <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
      {/* Date label */}
      <View style={{ paddingVertical: 8, paddingHorizontal: 4 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          {item.label}
        </Text>
      </View>

      {/* Transactions */}
      <View>{item.transactions.map((txn) => renderTransactionRow(txn))}</View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Header />

      {/* Search */}
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search transactions..."
          placeholderTextColor={textSecondary}
          style={{
            fontSize: 14,
            paddingVertical: 11,
            paddingHorizontal: 14,
            backgroundColor: inputBg,
            color: textPrimary,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: surfaceBorder,
          }}
        />
      </View>

      {/* Filter tabs */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: tabContainerBg,
            borderRadius: 25,
            padding: 3,
          }}
        >
          {(["all", "income", "expense"] as FilterType[]).map((type) => {
            const isActive = filterType === type;
            const activeTextColor = isDark ? "#000000" : "#FFFFFF";

            return (
              <Pressable
                key={type}
                onPress={() => {
                  haptics.lightTap();
                  setFilterType(type);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  borderRadius: 25,
                  alignItems: "center",
                  backgroundColor: isActive
                    ? isDark
                      ? "#FFFFFF"
                      : "#0A0A0A"
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: isActive ? activeTextColor : textSecondary,
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Undo banner */}
      {undoState && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: surfaceBorder,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, color: textSecondary }}>
            Transaction deleted
          </Text>
          <Pressable onPress={() => handleUndo().catch(() => undefined)}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#34D399" }}>
              Undo
            </Text>
          </Pressable>
        </View>
      )}

      {/* List */}
      {grouped.length > 0 ? (
        <FlatList
          data={grouped}
          renderItem={renderDateGroup}
          keyExtractor={(item) => item.date}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 14, color: textSecondary }}>
            {searchQuery || filterType !== "all"
              ? "No transactions found"
              : "No transactions yet"}
          </Text>
        </View>
      )}

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
