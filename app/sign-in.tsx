import { getTheme, Spacing, Typography } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SignInScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const themeMode = useThemeStore((state) => state.mode);
  const theme = getTheme(themeMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showForgotAlert, setShowForgotAlert] = useState(false);

  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);

  const toggleTab = (tab: "signin" | "signup") => {
    haptics.lightTap();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  const handleAuth = async () => {
    if (activeTab === "signin") {
      await handleSignIn();
    } else {
      await handleSignUp();
    }
  };

  const handleSignIn = async () => {
    haptics.mediumTap();
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      haptics.warning();
      Alert.alert(
        "Sign In Failed",
        error instanceof Error ? error.message : "Please try again",
      );
    }
  };

  const handleForgotPassword = () => {
    haptics.lightTap();
    setShowForgotAlert(true);
  };
  const handleSignUp = async () => {
    haptics.mediumTap();

    if (password !== confirmPassword) {
      haptics.warning();
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signup(fullName, email, password);
      router.replace("/(tabs)");
    } catch (error) {
      haptics.warning();
      Alert.alert(
        "Sign Up Failed",
        error instanceof Error ? error.message : "Please try again",
      );
    }
  };

  const isSignInFormValid = email && password;
  const isSignUpFormValid =
    fullName &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword;
  const isFormValid =
    activeTab === "signin" ? isSignInFormValid : isSignUpFormValid;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#0a0a0a",
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
            alignItems: "center",
          }}
        >
          {/* App Logo */}
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: "#ffffff",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: Spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#0a0a0a",
              }}
            >
              P
            </Text>
          </View>

          {/* App Title & Subtitle */}
          <Text
            style={{
              ...Typography.title,
              fontSize: 22,
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: Spacing.xs,
              textAlign: "center",
            }}
          >
            Welcome to PayU
          </Text>
          <Text
            style={{
              ...Typography.body,
              color: "#9ca3af",
              textAlign: "center",
              marginBottom: Spacing["3xl"],
            }}
          >
            Send money globally with the real exchange rate
          </Text>

          {/* Card */}
          <View
            style={{
              width: "100%",
              backgroundColor: "#1c1c1e",
              borderRadius: 20,
              padding: Spacing.lg,
            }}
          >
            {/* Card Header */}
            <Text
              style={{
                ...Typography.title,
                fontSize: 18,
                fontWeight: "700",
                color: "#ffffff",
                marginBottom: Spacing.xs,
              }}
            >
              Get started
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: "#9ca3af",
                marginBottom: Spacing.lg,
              }}
            >
              Sign in to your account or create a new one
            </Text>

            {/* Tab Switcher */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#2c2c2e",
                borderRadius: 25,
                padding: 4,
                marginBottom: Spacing.xl,
              }}
            >
              <Pressable
                onPress={() => toggleTab("signin")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: "center",
                  borderRadius: 25,
                  backgroundColor:
                    activeTab === "signin" ? "#ffffff" : "transparent",
                }}
              >
                <Text
                  style={{
                    ...Typography.label,
                    fontSize: 14,
                    fontWeight: "600",
                    color: activeTab === "signin" ? "#0a0a0a" : "#9ca3af",
                  }}
                >
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => toggleTab("signup")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: "center",
                  borderRadius: 25,
                  backgroundColor:
                    activeTab === "signup" ? "#ffffff" : "transparent",
                }}
              >
                <Text
                  style={{
                    ...Typography.label,
                    fontSize: 14,
                    fontWeight: "600",
                    color: activeTab === "signup" ? "#0a0a0a" : "#9ca3af",
                  }}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Content Form Container */}
            <View>
              {/* Full Name Input (Sign Up Only) */}
              {activeTab === "signup" && (
                <View style={{ marginBottom: Spacing.md }}>
                  <Text
                    style={{
                      ...Typography.label,
                      color: "#ffffff",
                      marginBottom: Spacing.sm,
                      fontSize: 14,
                    }}
                  >
                    Full Name
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#2c2c2e",
                      borderRadius: 10,
                      paddingHorizontal: Spacing.md,
                      paddingVertical: Spacing.md,
                      color: "#ffffff",
                      ...Typography.body,
                      fontSize: 15,
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor="#6b7280"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!isLoading}
                  />
                </View>
              )}

              {/* Email Input */}
              <View style={{ marginBottom: Spacing.md }}>
                <Text
                  style={{
                    ...Typography.label,
                    color: "#ffffff",
                    marginBottom: Spacing.sm,
                    fontSize: 14,
                  }}
                >
                  Email
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#2c2c2e",
                    borderRadius: 10,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.md,
                    color: "#ffffff",
                    ...Typography.body,
                    fontSize: 15,
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#6b7280"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  testID="signin-email-input"
                />
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: Spacing.sm }}>
                <Text
                  style={{
                    ...Typography.label,
                    color: "#ffffff",
                    marginBottom: Spacing.sm,
                    fontSize: 14,
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#2c2c2e",
                    borderRadius: 10,
                    paddingHorizontal: Spacing.md,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: Spacing.md,
                      color: "#ffffff",
                      ...Typography.body,
                      fontSize: 15,
                    }}
                    placeholder={
                      activeTab === "signin"
                        ? "Enter your password"
                        : "Create a password"
                    }
                    placeholderTextColor="#6b7280"
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
                    style={{ padding: 4 }}
                  >
                    {/* Eye Icon */}
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password Input (Sign Up Only) */}
              {activeTab === "signup" && (
                <View style={{ marginBottom: Spacing.sm }}>
                  <Text
                    style={{
                      ...Typography.label,
                      color: "#ffffff",
                      marginBottom: Spacing.sm,
                      fontSize: 14,
                    }}
                  >
                    Confirm Password
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#2c2c2e",
                      borderRadius: 10,
                      paddingHorizontal: Spacing.md,
                      borderColor:
                        password !== confirmPassword && confirmPassword
                          ? "#ef4444"
                          : "transparent",
                      borderWidth: 1,
                    }}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: Spacing.md,
                        color: "#ffffff",
                        ...Typography.body,
                        fontSize: 15,
                      }}
                      placeholder="Confirm your password"
                      placeholderTextColor="#6b7280"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      editable={!isLoading}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <Pressable
                      onPress={() => {
                        haptics.lightTap();
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      disabled={isLoading}
                      style={{ padding: 4 }}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#9ca3af"
                      />
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Forgot Password */}
              {activeTab === "signin" && (
                <View
                  style={{ alignItems: "flex-end", marginBottom: Spacing.xl }}
                >
                  <Pressable
                    onPress={handleForgotPassword}
                    disabled={isLoading}
                  >
                    <Text
                      style={{
                        ...Typography.body,
                        color: theme.colors.tint,
                        fontSize: 13,
                        fontWeight: "500",
                      }}
                    >
                      Forgot password?
                    </Text>
                  </Pressable>
                </View>
              )}

              <View
                style={{ height: activeTab === "signup" ? Spacing.xl : 0 }}
              />

              {/* Submit Button */}
              <Pressable
                onPress={handleAuth}
                disabled={isLoading || !isFormValid}
                style={({ pressed }) => [
                  {
                    backgroundColor:
                      isLoading || !isFormValid ? "#3a3a3c" : "#ffffff",
                    paddingVertical: Spacing.md,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                testID="auth-button"
              >
                {isLoading ? (
                  <ActivityIndicator color="#0a0a0a" />
                ) : (
                  <Text
                    style={{
                      ...Typography.label,
                      color: isLoading || !isFormValid ? "#6b7280" : "#0a0a0a",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {activeTab === "signin" ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Forgot Password Animated Modal */}
      <Modal
        visible={showForgotAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotAlert(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: "#1c1c1e",
              borderRadius: 20,
              padding: Spacing.xl,
              borderWidth: 1,
              borderColor: "#2c2c2e",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Text
              style={{
                ...Typography.title,
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
                marginBottom: Spacing.sm,
                color: "#ffffff",
              }}
            >
              Forgot Password
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: "#d1d5db",
                textAlign: "center",
                marginBottom: Spacing.xl,
              }}
            >
              An email will be sent on the registered email id.
            </Text>

            <Pressable
              onPress={() => {
                haptics.lightTap();
                setShowForgotAlert(false);
              }}
              style={({ pressed }) => ({
                backgroundColor: "#ffffff",
                paddingVertical: Spacing.md,
                borderRadius: 10,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{
                  ...Typography.label,
                  color: "#0a0a0a",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Got it
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
