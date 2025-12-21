import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { UK_AREAS } from "@/lib/types";

interface AreaSelectorProps {
  selectedArea: string | null;
  onSelectArea: (area: string) => void;
}

export function AreaSelector({ selectedArea, onSelectArea }: AreaSelectorProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {UK_AREAS.map((area) => {
        const isSelected = selectedArea === area.value;
        return (
          <Pressable
            key={area.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onSelectArea(area.value);
            }}
            style={[
              styles.areaItem,
              {
                backgroundColor: isSelected
                  ? theme.brandGreen + "15"
                  : theme.backgroundDefault,
                borderColor: isSelected ? theme.brandGreen : theme.border,
              },
            ]}
          >
            <ThemedText
              type="body"
              style={[
                styles.areaLabel,
                { color: isSelected ? theme.brandGreen : theme.text },
              ]}
            >
              {area.label}
            </ThemedText>
            {isSelected ? (
              <Feather name="check" size={20} color={theme.brandGreen} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  areaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  areaLabel: {
    flex: 1,
  },
});
