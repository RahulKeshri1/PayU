import { Colors, getTheme, Spacing, Typography } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const themeMode = useThemeStore((state) => state.mode);
  const theme = getTheme(themeMode);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSignUp = async () => {
    haptics.mediumTap();

    // Validate inputs
    if (password !== confirmPassword) {
      haptics.warning();
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signup(fullName, email, password);
      // Navigate to home after successful signup
      router.replace("/(tabs)");
    } catch (error) {
      haptics.warning();
      Alert.alert(
        "Sign Up Failed",
        error instanceof Error ? error.message : "Please try again",
      );
    }
  };

  const handleNavigateToSignIn = () => {
    haptics.lightTap();
    router.push("/sign-in");
  };

  const isFormValid =
    fullName &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.xl,
            justifyContent: "center",
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: Spacing["3xl"] }}>
            <Text
              style={{
                ...Typography.title,
                fontSize: 28,
                color: theme.colors.text,
                marginBottom: Spacing.sm,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: theme.colors.textSecondary,
              }}
            >
              Start managing your finances today
            </Text>
          </View>

          {/* Full Name Input */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text
              style={{
                ...Typography.label,
                color: theme.colors.text,
                marginBottom: Spacing.sm,
              }}
            >
              Full Name
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.md,
                color: theme.colors.text,
                ...Typography.body,
              }}
              placeholder="John Doe"
              placeholderTextColor={theme.colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              editable={!isLoading}
              testID="signup-fullname-input"
            />
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text
              style={{
                ...Typography.label,
                color: theme.colors.text,
                marginBottom: Spacing.sm,
              }}
            >
              Email
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.md,
                color: theme.colors.text,
                ...Typography.body,
              }}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="signup-email-input"
            />
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text
              style={{
                ...Typography.label,
                color: theme.colors.text,
                marginBottom: Spacing.sm,
              }}
            >
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: Spacing.md,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: Spacing.md,
                  color: theme.colors.text,
                  ...Typography.body,
                }}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry={!showPassword}
                testID="signup-password-input"
              />
              <Pressable
                onPress={() => {
                  haptics.lightTap();
                  setShowPassword(!showPassword);
                }}
                disabled={isLoading}
              >
                <Text
                  style={{
                    ...Typography.body,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text
              style={{
                ...Typography.label,
                color: theme.colors.text,
                marginBottom: Spacing.sm,
              }}
            >
              Confirm Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderColor:
                  password !== confirmPassword && confirmPassword
                    ? Colors.expense
                    : theme.colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: Spacing.md,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: Spacing.md,
                  color: theme.colors.text,
                  ...Typography.body,
                }}
                placeholder="Confirm your password"
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
                secureTextEntry={!showConfirmPassword}
                testID="signup-confirm-password-input"
              />
              <Pressable
                onPress={() => {
                  haptics.lightTap();
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                disabled={isLoading}
              >
                <Text
                  style={{
                    ...Typography.body,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
            disabled={isLoading || !isFormValid}
            style={({ pressed }) => [
              {
                backgroundColor:
                  isLoading || !isFormValid
                    ? theme.colors.disabled
                    : theme.colors.tint,
                paddingVertical: Spacing.md,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            testID="signup-button"
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text
                style={{
                  ...Typography.label,
                  color:
                    themeMode === "dark"
                      ? theme.colors.background
                      : theme.colors.text,
                  fontSize: 15,
                }}
              >
                Create Account
              </Text>
            )}
          </Pressable>

          {/* Sign In Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: Spacing["2xl"],
            }}
          >
            <Text
              style={{
                ...Typography.body,
                color: theme.colors.textSecondary,
              }}
            >
              Already have an account?{" "}
            </Text>
            <Pressable onPress={handleNavigateToSignIn} disabled={isLoading}>
              <Text
                style={{
                  ...Typography.label,
                  color: theme.colors.tint,
                }}
              >
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
