import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
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

// Get soft color based on category
const getCategoryColor = (category: string | null): { background: string; accent: string } => {
  const colors: Record<string, { background: string; accent: string }> = {
    "landscape": { background: "#E8F5E9", accent: "#66BB6A" },      // Light green
    "landscaping": { background: "#E8F5E9", accent: "#66BB6A" },    // Light green
    "gardening": { background: "#C8E6C9", accent: "#388E3C" },      // Dark green
    "garden": { background: "#C8E6C9", accent: "#388E3C" },         // Dark green
    "maintenance": { background: "#FFF8E1", accent: "#D4A574" },    // Beige
    "cleaning": { background: "#E3F2FD", accent: "#064dabff" },       // Navy blue
    "home improvements": { background: "#F3E5F5", accent: "#9C27B0" }, // Lavender/Purple
    "home improvement": { background: "#F3E5F5", accent: "#9C27B0" },  // Lavender/Purple
    "painting": { background: "#FCE4EC", accent: "#E91E63" },       // Pink
    "moving": { background: "#ECEFF1", accent: "#607D8B" },         // Gray
  };

  return colors[category?.toLowerCase() || ""] || { background: "#E8F5E9", accent: "#4CAF50" }; // Default green
};

export function ServiceCard({ service, onPress }: ServiceCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const iconName = getIconForService(service.icon_key, service.category);
  const categoryColors = getCategoryColor(service.category);

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
      <View style={[styles.iconContainer, { backgroundColor: categoryColors.background }]}>
        {service.icon_url ? (
          <Image
            source={{ uri: service.icon_url }}
            style={styles.customIcon}
            resizeMode="contain"
          />
        ) : (
          <Feather name={iconName} size={32} color={categoryColors.accent} />
        )}
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
                style={[styles.price, { color: categoryColors.accent }]}
              >
                {service.starting_price_label}
              </ThemedText>
            ) : null}
          </View>

          <View style={[styles.bookButton, { backgroundColor: categoryColors.accent }]}>
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  customIcon: {
    width: 64,
    height: 64,
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
