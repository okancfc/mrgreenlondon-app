import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip, getStatusChipVariant, getStatusLabel } from "@/components/Chip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getBookingById, cancelBooking } from "@/lib/api";
import { BookingWithDetails } from "@/lib/types";
import { queryClient } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "BookingDetail">;

export default function BookingDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();

  const { bookingId } = route.params;

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error("Error loading booking:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to load booking details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleCancel = () => {
    if (!booking) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: confirmCancel,
        },
      ]
    );
  };

  const confirmCancel = async () => {
    if (!booking) return;

    setIsCanceling(true);
    try {
      await cancelBooking(booking.id, "Canceled by user");
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Booking Canceled", "Your booking has been canceled.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "Failed to cancel booking.");
    } finally {
      setIsCanceling(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCreatedAt = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancel = booking?.status === "requested" || booking?.status === "confirmed";

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.brandGreen} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Booking not found</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Booking Details</ThemedText>
        <View style={styles.spacer} />
      </View>

      <View style={styles.statusRow}>
        <ThemedText type="h3">{booking.service?.name || "Service"}</ThemedText>
        <Chip
          label={getStatusLabel(booking.status)}
          variant={getStatusChipVariant(booking.status)}
        />
      </View>

      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={20} color={theme.brandGreen} />
          <View style={styles.detailContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Date
            </ThemedText>
            <ThemedText type="body">{formatDate(booking.scheduled_at)}</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.detailRow}>
          <Feather name="clock" size={20} color={theme.brandGreen} />
          <View style={styles.detailContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Time
            </ThemedText>
            <ThemedText type="body">{formatTime(booking.scheduled_at)}</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.detailRow}>
          <Feather name="map-pin" size={20} color={theme.brandGreen} />
          <View style={styles.detailContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Address
            </ThemedText>
            {booking.address ? (
              <>
                <ThemedText type="body">{booking.address.line1}</ThemedText>
                {booking.address.line2 ? (
                  <ThemedText type="body">{booking.address.line2}</ThemedText>
                ) : null}
                <ThemedText type="body">
                  {booking.address.city}, {booking.address.postcode}
                </ThemedText>
              </>
            ) : (
              <ThemedText type="body">No address provided</ThemedText>
            )}
          </View>
        </View>

        {booking.notes ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.detailRow}>
              <Feather name="file-text" size={20} color={theme.brandGreen} />
              <View style={styles.detailContent}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Notes
                </ThemedText>
                <ThemedText type="body">{booking.notes}</ThemedText>
              </View>
            </View>
          </>
        ) : null}

        {booking.cancel_reason ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.detailRow}>
              <Feather name="x-circle" size={20} color={theme.error} />
              <View style={styles.detailContent}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Cancellation Reason
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.error }}>
                  {booking.cancel_reason}
                </ThemedText>
              </View>
            </View>
          </>
        ) : null}
      </Card>

      <View style={styles.metaInfo}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Booking created on {formatCreatedAt(booking.created_at)}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Booking ID: {booking.id.slice(0, 8)}
        </ThemedText>
      </View>

      {canCancel ? (
        <Button
          onPress={handleCancel}
          disabled={isCanceling}
          style={styles.cancelButton}
        >
          {isCanceling ? "Canceling..." : "Cancel Booking"}
        </Button>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  spacer: {
    width: 40,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  detailsCard: {
    marginBottom: Spacing.xl,
  },
  detailRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  metaInfo: {
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  cancelButton: {
    backgroundColor: "#DC2626",
  },
});
