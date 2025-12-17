import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Service } from "@/lib/types";

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getIconForService = (iconKey: string | null, category: string | null): keyof typeof Feather.glyphMap => {
  if (iconKey) {
    const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
      "lawn": "sun",
      "garden": "sun",
      "tree": "wind",
      "cleaning": "home",
      "hedge": "layers",
      "patio": "grid",
      "fence": "square",
      "planting": "droplet",
    };
    return iconMap[iconKey] || "tool";
  }
  
  const categoryMap: Record<string, keyof typeof Feather.glyphMap> = {
    "landscaping": "sun",
    "garden": "sun",
    "cleaning": "home",
    "maintenance": "tool",
  };
  
  return categoryMap[category?.toLowerCase() || ""] || "tool";
};

export function ServiceCard({ service, onPress }: ServiceCardProps) {
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

  const iconName = getIconForService(service.icon_key, service.category);

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
      <View style={[styles.iconContainer, { backgroundColor: theme.brandGreen + "15" }]}>
        <Feather name={iconName} size={32} color={theme.brandGreen} />
      </View>
      
      <View style={styles.content}>
        <ThemedText type="h4" style={styles.name}>
          {service.name}
        </ThemedText>
        
        {service.description ? (
          <ThemedText
            type="small"
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {service.description}
          </ThemedText>
        ) : null}
        
        <View style={styles.footer}>
          <View style={styles.details}>
            {service.estimated_duration_minutes ? (
              <View style={styles.detailItem}>
                <Feather name="clock" size={14} color={theme.textSecondary} />
                <ThemedText
                  type="small"
                  style={[styles.detailText, { color: theme.textSecondary }]}
                >
                  {service.estimated_duration_minutes} min
                </ThemedText>
              </View>
            ) : null}
            
            {service.starting_price_label ? (
              <ThemedText
                type="small"
                style={[styles.price, { color: theme.brandGreen }]}
              >
                {service.starting_price_label}
              </ThemedText>
            ) : null}
          </View>
          
          <View style={[styles.bookButton, { backgroundColor: theme.brandGreen }]}>
            <ThemedText style={styles.bookButtonText}>Book</ThemedText>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  description: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  detailText: {},
  price: {
    fontWeight: "600",
  },
  bookButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
