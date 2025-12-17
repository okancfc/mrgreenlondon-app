import React, { useCallback, useState } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getBookings } from "@/lib/api";
import { BookingWithDetails } from "@/lib/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = "upcoming" | "past";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  const {
    data: bookings,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: () => (user?.id ? getBookings(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const filteredBookings = React.useMemo(() => {
    if (!bookings) return [];
    
    const now = new Date();
    return bookings.filter((booking) => {
      const scheduledDate = new Date(booking.scheduled_at);
      const isPast = scheduledDate < now || booking.status === "completed" || booking.status === "canceled";
      return activeTab === "past" ? isPast : !isPast;
    });
  }, [bookings, activeTab]);

  const handleBookingPress = useCallback(
    (booking: BookingWithDetails) => {
      navigation.navigate("BookingDetail", { bookingId: booking.id });
    },
    [navigation]
  );

  const handleNavigateToHome = useCallback(() => {
    navigation.navigate("Main", { screen: "HomeTab" });
  }, [navigation]);

  const renderBooking = useCallback(
    ({ item }: { item: BookingWithDetails }) => (
      <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
    ),
    [handleBookingPress]
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: theme.backgroundDefault }]}>
      <Pressable
        onPress={() => setActiveTab("upcoming")}
        style={[
          styles.tab,
          activeTab === "upcoming" && { backgroundColor: theme.brandGreen },
        ]}
      >
        <ThemedText
          style={[
            styles.tabText,
            { color: activeTab === "upcoming" ? "#FFFFFF" : theme.textSecondary },
          ]}
        >
          Upcoming
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => setActiveTab("past")}
        style={[
          styles.tab,
          activeTab === "past" && { backgroundColor: theme.brandGreen },
        ]}
      >
        <ThemedText
          style={[
            styles.tabText,
            { color: activeTab === "past" ? "#FFFFFF" : theme.textSecondary },
          ]}
        >
          Past
        </ThemedText>
      </Pressable>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandGreen} />
        </View>
      );
    }

    return (
      <EmptyState
        icon="calendar"
        title={activeTab === "upcoming" ? "No Upcoming Bookings" : "No Past Bookings"}
        description={
          activeTab === "upcoming"
            ? "Browse our services and book your first appointment"
            : "Your completed bookings will appear here"
        }
        actionLabel={activeTab === "upcoming" ? "Browse Services" : undefined}
        onAction={activeTab === "upcoming" ? handleNavigateToHome : undefined}
      />
    );
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
        !filteredBookings.length && !isLoading ? styles.emptyContent : null,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={filteredBookings}
      renderItem={renderBooking}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderTabs}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.brandGreen}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  tabText: {
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
});
