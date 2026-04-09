import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? "light";

  return (
    <ThemedView>
      <Pressable
        onPress={() => setIsOpen((value) => !value)}
        style={({ pressed }) => [
          styles.heading,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        {({ pressed }) => (
          <>
            <Ionicons
              name={
                pressed ? "chevron-forward-sharp" : "chevron-forward-outline"
              }
              size={18}
              color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
              style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
            />
            <ThemedText type="defaultSemiBold">{title}</ThemedText>
          </>
        )}
      </Pressable>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
