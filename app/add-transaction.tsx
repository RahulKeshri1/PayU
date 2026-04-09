import Header from "@/components/Header";
import { getTheme } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { useCategoryStore } from "@/store/categoryStore";
import { useThemeStore } from "@/store/themeStore";
import { useTransactionStore } from "@/store/transactionStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTransactionModal() {
  const haptics = useHapticFeedback();
  const router = useRouter();
  const themeMode = useThemeStore((state) => state.mode);
  const theme = getTheme(themeMode);
  const isDark = themeMode === "dark";

  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const getAllCategories = useCategoryStore((state) => state.getAllCategories);
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset category when type changes
  useEffect(() => {
    // Check if current category is still valid for this type
    const currentCat = getCategoryById(selectedCategory);
    if (currentCat && currentCat.type !== "both" && currentCat.type !== type) {
      setSelectedCategory("");
    }
  }, [type, selectedCategory, getCategoryById]);

  const categories = getAllCategories().filter(
    (cat) => cat.type === type || cat.type === "both",
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
      newErrors.amount = "Valid positive amount required";
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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const dateIso = selectedDate.toISOString().split("T")[0];
    const category = getCategoryById(selectedCategory);

    try {
      await addTransaction({
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

      haptics.success();
      router.back();
    } catch (error) {
      haptics.warning();
      setSubmitError(error instanceof Error ? error.message : "Failed to add transaction");
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
      if (event.type === "dismissed") {
        setShowDatePicker(false);
        return;
      }
      if (date) {
        setSelectedDate(date);
      }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
              Add Transaction
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
                        color: isActive
                          ? activeTextColor
                          : theme.colors.textSecondary,
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
                ...theme.elevation.card,
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
                      borderRadius: theme.borderRadius.pill,
                      backgroundColor: isDark
                        ? "#FFFFFF"
                        : (item.color ?? "#d8d8d8"),
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor:
                        selectedCategory === item.id
                          ? isDark
                            ? "#FFFFFF"
                            : "#000000"
                          : isDark
                            ? "#6B7280"
                            : "#A0A0A0",
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
                ...theme.elevation.card,
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
                ...theme.elevation.card,
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
                onChange={handleDateChange}
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
                ...theme.elevation.card,
              }}
            />
          </View>

          {/* Submit */}
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => ({
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: theme.colors.tint,
                borderRadius: theme.borderRadius.md,
                alignItems: "center",
                opacity: pressed ? theme.opacity.pressed : 1,
                ...theme.elevation.floating,
              })}
            >
              <Text
                style={{
                  ...theme.typography.label,
                  color: isDark ? "#000000" : "#FFFFFF",
                  fontWeight: "600",
                }}
              >
                Add Transaction
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
