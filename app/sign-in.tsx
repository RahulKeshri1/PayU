import { getTheme, Spacing, Typography } from "@/constants/theme";
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

export default function SignInScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const themeMode = useThemeStore((state) => state.mode);
  const theme = getTheme(themeMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSignIn = async () => {
    haptics.mediumTap();

    try {
      await login(email, password);
      // Navigate to home after successful login
      router.replace("/(tabs)");
    } catch (error) {
      haptics.warning();
      Alert.alert(
        "Sign In Failed",
        error instanceof Error ? error.message : "Please try again",
      );
    }
  };

  const handleNavigateToSignUp = () => {
    haptics.lightTap();
    router.push("/sign-up");
  };

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
              Welcome Back
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: theme.colors.textSecondary,
              }}
            >
              Sign in to manage your finances
            </Text>
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
              testID="signin-email-input"
            />
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: Spacing.xl }}>
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
                testID="signin-password-input"
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

          {/* Sign In Button */}
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading || !email || !password}
            style={({ pressed }) => [
              {
                backgroundColor:
                  isLoading || !email || !password
                    ? theme.colors.disabled
                    : theme.colors.tint,
                paddingVertical: Spacing.md,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            testID="signin-button"
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
                Sign In
              </Text>
            )}
          </Pressable>

          {/* Sign Up Link */}
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
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={handleNavigateToSignUp} disabled={isLoading}>
              <Text
                style={{
                  ...Typography.label,
                  color: theme.colors.tint,
                }}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
