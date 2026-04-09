import Header from "@/components/Header";
import { getTheme } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { useCategoryStore } from "@/store/categoryStore";
import { useThemeStore } from "@/store/themeStore";
import { useTransactionStore } from "@/store/transactionStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EditTransactionModal() {
  const haptics = useHapticFeedback();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const themeMode = useThemeStore((state) => state.mode);
  const theme = getTheme(themeMode);
  const isDark = themeMode === "dark";

  const transactions = useTransactionStore((state) => state.transactions);
  const updateTransaction = useTransactionStore(
    (state) => state.updateTransaction,
  );
  const deleteTransaction = useTransactionStore(
    (state) => state.deleteTransaction,
  );
  const getAllCategories = useCategoryStore((state) => state.getAllCategories);
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);

  const transaction = transactions.find((t) => t.id === id);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setSelectedCategory(transaction.category);
      setTitle(transaction.title);
      setNote(transaction.note || "");
      setSelectedDate(new Date(transaction.date));
    }
  }, [transaction]);

  const categories = getAllCategories().filter(
    (cat) => cat.type === type || cat.type === "both",
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!amount || isNaN(parseFloat(amount))) {
      newErrors.amount = "Valid amount required";
    }
    if (!selectedCategory) {
      newErrors.category = "Category required";
    }
    if (!title.trim()) {
      newErrors.title = "Title required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!transaction || !validateForm()) return;

    haptics.success();

    const dateIso = selectedDate.toISOString().split("T")[0];
    const category = getCategoryById(selectedCategory);

    await updateTransaction(transaction.id, {
      type,
      amount: parseFloat(amount),
      category: selectedCategory,
      categoryIcon: category?.emoji || "📌",
      categoryColor: category?.color || "#FDCB6E",
      title,
      note: note || undefined,
      date: dateIso,
      timestamp: selectedDate.toISOString(),
    });

    router.back();
  };

  const handleDelete = async () => {
    if (!transaction) return;
    haptics.success();
    await deleteTransaction(transaction.id);
    router.back();
  };

  const handleDateChange = (event: any, date: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleDismiss = () => {
    setShowDatePicker(false);
  };

  if (!transaction) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            ...theme.typography.body,
            color: theme.colors.textSecondary,
          }}
        >
          Transaction not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: theme.spacing["4xl"] }}
          >
            <Header />
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                ...theme.typography.sectionHeader,
                color: theme.colors.text,
              }}
            >
              Edit Transaction
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={{ padding: theme.spacing.md }}
            >
              <Text style={{ fontSize: 24, color: theme.colors.textSecondary }}>
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Type Toggle */}
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA",
                  borderRadius: 25,
                  padding: 3,
                }}
              >
                {(["expense", "income"] as const).map((t) => {
                  const isActive = type === t;
                  const activeTextColor = isDark ? "#000000" : "#FFFFFF";
                  return (
                    <Pressable
                      key={t}
                      onPress={() => {
                        haptics.lightTap();
                        setType(t);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
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
                          fontSize: 14,
                          fontWeight: "600",
                          color: isActive ? activeTextColor : theme.colors.textSecondary,
                        }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
                </View>
              </View>

              {/* Amount */}
              <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.label,
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
              }}
            >
              Amount
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="₹0.00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
              style={{
                ...theme.typography.body,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.md,
                borderWidth: errors.amount ? 2 : 0,
                borderColor: errors.amount
                  ? theme.colors.expense
                  : "transparent",
              }}
            />
            {errors.amount && (
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.colors.expense,
                  marginTop: theme.spacing.xs,
                }}
              >
                {errors.amount}
              </Text>
            )}
          </View>

          {/* Category */}
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.label,
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
              }}
            >
              Category
            </Text>
            <FlatList
              data={categories}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSelectedCategory(item.id)}
                  style={{
                    alignItems: "center",
                    marginRight: theme.spacing.md,
                    opacity: selectedCategory === item.id ? 1 : 0.6,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: isDark ? "#FFFFFF" : (item.color ?? "#d8d8d8"),
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: selectedCategory === item.id ? 2 : 0,
                      borderColor: isDark ? "#6B7280" : "#A0A0A0",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                  </View>
                  <Text
                    style={{
                      ...theme.typography.caption,
                      color: theme.colors.textSecondary,
                      marginTop: theme.spacing.xs,
                      maxWidth: 50,
                      textAlign: "center",
                    }}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
            />
            {errors.category && (
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.colors.expense,
                  marginTop: theme.spacing.md,
                }}
              >
                {errors.category}
              </Text>
            )}
          </View>

          {/* Title */}
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.label,
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
              }}
            >
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={
                selectedCategory
                  ? `e.g., ${getCategoryById(selectedCategory)?.name || "Lunch"}`
                  : "e.g., Lunch"
              }
              placeholderTextColor={theme.colors.textSecondary}
              style={{
                ...theme.typography.body,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.md,
                borderWidth: errors.title ? 2 : 0,
                borderColor: errors.title
                  ? theme.colors.expense
                  : "transparent",
              }}
            />
            {errors.title && (
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.colors.expense,
                  marginTop: theme.spacing.xs,
                }}
              >
                {errors.title}
              </Text>
            )}
          </View>

          {/* Date */}
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.label,
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
              }}
            >
              Date
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={{
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.md,
              }}
            >
              <Text
                style={{ ...theme.typography.body, color: theme.colors.text }}
              >
                {selectedDate.toDateString()}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                maximumDate={new Date()}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onValueChange={handleDateChange}
                onDismiss={handleDismiss}
              />
            )}
          </View>

          {/* Note */}
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.label,
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
              }}
            >
              Note (Optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add notes..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
              style={{
                ...theme.typography.body,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.md,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Buttons */}
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              gap: theme.spacing.md,
            }}
          >
            <Pressable
              onPress={handleUpdate}
              style={({ pressed }) => ({
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: theme.colors.tint,
                borderRadius: theme.borderRadius.md,
                alignItems: "center",
                opacity: pressed ? theme.opacity.pressed : 1,
              })}
            >
              <Text
                style={{
                  ...theme.typography.label,
                  color: isDark ? "#000000" : "#FFFFFF",
                  fontWeight: "600",
                }}
              >
                Update Transaction
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => ({
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.md,
                alignItems: "center",
                opacity: pressed ? theme.opacity.pressed : 1,
              })}
            >
              <Text
                style={{
                  ...theme.typography.label,
                  color: theme.colors.expense,
                  fontWeight: "600",
                }}
              >
                Delete Transaction
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
