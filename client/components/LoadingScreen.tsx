import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ActivityIndicator size="large" color={theme.brandGreen} />
      {message ? (
        <ThemedText
          type="body"
          style={[styles.message, { color: theme.textSecondary }]}
        >
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  message: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
});
