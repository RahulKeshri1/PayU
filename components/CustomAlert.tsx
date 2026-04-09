import { Spacing, Typography } from "@/constants/theme";
import { useHapticFeedback } from "@/hooks/useHaptics";
import { useAlertStore } from "@/store/alertStore";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

export default function CustomAlert() {
  const { visible, title, message, buttons, hideAlert } = useAlertStore();
  const haptics = useHapticFeedback();

  // Match signin dark alert theme

  // Match signin dark alert theme
  const containerBg = "#1c1c1e";
  const containerBorder = "#2c2c2e";
  const titleColor = "#ffffff";
  const messageColor = "#d1d5db";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={hideAlert}
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
            backgroundColor: containerBg,
            borderRadius: 20,
            padding: Spacing.xl,
            borderWidth: 1,
            borderColor: containerBorder,
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
          {title ? (
            <Text
              style={{
                ...Typography.title,
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
                marginBottom: message ? Spacing.sm : Spacing.lg,
                color: titleColor,
              }}
            >
              {title}
            </Text>
          ) : null}

          {message ? (
            <Text
              style={{
                ...Typography.body,
                color: messageColor,
                textAlign: "center",
                marginBottom: Spacing.xl,
              }}
            >
              {message}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: buttons.length > 2 ? "column" : "row",
              gap: 10,
              justifyContent: "center",
              width: "100%",
            }}
          >
            {buttons.map((btn, index) => {
              const isDestructive = btn.style === "destructive";
              const isCancel = btn.style === "cancel";

              // Base colors
              let btnBg = "#ffffff";
              let btnText = "#0a0a0a";

              if (isDestructive) {
                btnBg = "#ef4444";
                btnText = "#ffffff";
              } else if (isCancel) {
                btnBg = "#3a3a3c";
                btnText = "#ffffff";
              }

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    haptics.lightTap();
                    btn.onPress?.();
                    hideAlert();
                  }}
                  style={({ pressed }) => ({
                    flex: buttons.length > 2 ? undefined : 1,
                    backgroundColor: btnBg,
                    paddingVertical: Spacing.md,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      ...Typography.label,
                      color: btnText,
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
