import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { AreaSelector } from "@/components/AreaSelector";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { setSelectedArea } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingAreaScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [selectedAreaValue, setSelectedAreaValue] = useState<string | null>(null);

  const handleNext = async () => {
    if (selectedAreaValue) {
      await setSelectedArea(selectedAreaValue);
    }
    navigation.navigate("OnboardingHowItWorks");
  };

  const handleSkip = () => {
    navigation.navigate("OnboardingHowItWorks");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ThemedText style={{ color: theme.text }}>Back</ThemedText>
        </Pressable>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText style={{ color: theme.textSecondary }}>Skip</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h2" style={styles.title}>
          Choose Your Area
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          Select your London area to find services available near you.
        </ThemedText>

        <AreaSelector
          selectedArea={selectedAreaValue}
          onSelectArea={setSelectedAreaValue}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
          <View style={[styles.dot, styles.dotActive, { backgroundColor: theme.brandGreen }]} />
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
        </View>

        <Button
          onPress={handleNext}
          style={styles.button}
          disabled={!selectedAreaValue}
        >
          Next
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  button: {
    backgroundColor: "#1F7A3B",
  },
});
