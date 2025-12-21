import React, { useCallback, useState, useRef, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Pressable, ActivityIndicator, Animated, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
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

  // Animation for sliding indicator
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === "upcoming" ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [activeTab, slideAnim]);

  const handleTabLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabWidth(width / 2);
  };

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
    <View
      style={[styles.tabsContainer, { backgroundColor: theme.backgroundDefault }]}
      onLayout={handleTabLayout}
    >
      {/* Animated sliding indicator */}
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            backgroundColor: theme.brandGreen,
            width: tabWidth - Spacing.xs,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Spacing.xs / 2, tabWidth + Spacing.xs / 2],
                }),
              },
            ],
          },
        ]}
      />

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActiveTab("upcoming");
        }}
        style={styles.tab}
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
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActiveTab("past");
        }}
        style={styles.tab}
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
      showsVerticalScrollIndicator={false}
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
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: Spacing.xs,
    bottom: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
    zIndex: 1,
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
