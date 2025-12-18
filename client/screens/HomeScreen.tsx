import React, { useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { ServiceCard } from "@/components/ServiceCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing } from "@/constants/theme";
import { getServices } from "@/lib/api";
import { Service } from "@/lib/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const {
    data: services,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  const handleServicePress = useCallback(
    (service: Service) => {
      navigation.navigate("Booking", { serviceId: service.id, serviceName: service.name });
    },
    [navigation]
  );

  const renderService = useCallback(
    ({ item }: { item: Service }) => (
      <ServiceCard service={item} onPress={() => handleServicePress(item)} />
    ),
    [handleServicePress]
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ThemedText type="body" style={{ color: theme.textSecondary }}>
        Hello{profile?.full_name ? `, ${profile.full_name}` : ""}
      </ThemedText>
      {profile?.area ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Serving {profile.area} London
        </ThemedText>
      ) : null}
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
        icon="tool"
        title="No Services Available"
        description="Check back soon for new services in your area."
        actionLabel="Refresh"
        onAction={refetch}
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
        !services?.length && !isLoading ? styles.emptyContent : null,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
      data={services || []}
      renderItem={renderService}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
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
  headerContainer: {
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
});
