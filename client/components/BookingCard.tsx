import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Chip, getStatusChipVariant, getStatusLabel } from "@/components/Chip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { BookingWithDetails } from "@/lib/types";

interface BookingCardProps {
  booking: BookingWithDetails;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingCard({ booking, onPress }: BookingCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const shortAddress = booking.address
    ? `${booking.address.line1}, ${booking.address.postcode}`
    : "";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h4" style={styles.serviceName}>
          {booking.service?.name || "Service"}
        </ThemedText>
        <Chip
          label={getStatusLabel(booking.status)}
          variant={getStatusChipVariant(booking.status)}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={[styles.detailText, { color: theme.textSecondary }]}
          >
            {formatDate(booking.scheduled_at)}
          </ThemedText>
        </View>

        <View style={styles.detailRow}>
          <Feather name="clock" size={16} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={[styles.detailText, { color: theme.textSecondary }]}
          >
            {formatTime(booking.scheduled_at)}
          </ThemedText>
        </View>
      </View>

      {shortAddress ? (
        <View style={styles.addressRow}>
          <Feather name="map-pin" size={16} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={[styles.addressText, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {shortAddress}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <ThemedText
          type="small"
          style={[styles.viewDetails, { color: theme.brandGreen }]}
        >
          View Details
        </ThemedText>
        <Feather name="chevron-right" size={16} color={theme.brandGreen} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  serviceName: {
    flex: 1,
    marginRight: Spacing.md,
  },
  details: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailText: {},
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addressText: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  viewDetails: {
    fontWeight: "600",
  },
});
