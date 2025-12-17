import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { BookingStatus } from "@/lib/types";

interface ChipProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "muted";
  style?: ViewStyle;
}

export function Chip({ label, variant = "default", style }: ChipProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case "success":
        return theme.brandGreen + "20";
      case "warning":
        return theme.accentOrange + "20";
      case "error":
        return theme.error + "20";
      case "muted":
        return theme.textSecondary + "20";
      default:
        return theme.brandGreen + "20";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "success":
        return theme.brandGreen;
      case "warning":
        return theme.accentOrange;
      case "error":
        return theme.error;
      case "muted":
        return theme.textSecondary;
      default:
        return theme.brandGreen;
    }
  };

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <ThemedText
        type="small"
        style={[styles.label, { color: getTextColor() }]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

export function getStatusChipVariant(status: BookingStatus): ChipProps["variant"] {
  switch (status) {
    case "requested":
      return "warning";
    case "confirmed":
      return "success";
    case "completed":
      return "muted";
    case "canceled":
      return "error";
    default:
      return "default";
  }
}

export function getStatusLabel(status: BookingStatus): string {
  switch (status) {
    case "requested":
      return "Requested";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "canceled":
      return "Canceled";
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  label: {
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
