import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { setOnboardingCompleted } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const steps = [
  {
    icon: "search" as const,
    title: "Pick a Service",
    description: "Browse our range of trusted home and garden services",
  },
  {
    icon: "calendar" as const,
    title: "Choose Your Time",
    description: "Select a convenient date and time that works for you",
  },
  {
    icon: "check-circle" as const,
    title: "We Confirm",
    description: "Receive confirmation and get ready for your appointment",
  },
];

export default function OnboardingHowItWorksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { setOnboardingComplete } = useAuth();

  const handleGetStarted = async () => {
    await setOnboardingCompleted(true);
    setOnboardingComplete(true);
    navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
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
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <ThemedText type="h2" style={styles.title}>
          How It Works
        </ThemedText>

        <View style={styles.steps}>
          {steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <View
                style={[
                  styles.stepIcon,
                  { backgroundColor: theme.brandGreen + "15" },
                ]}
              >
                <Feather name={step.icon} size={28} color={theme.brandGreen} />
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="h4" style={styles.stepTitle}>
                  {step.title}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.stepDescription, { color: theme.textSecondary }]}
                >
                  {step.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
          <View style={[styles.dot, styles.dotActive, { backgroundColor: theme.brandGreen }]} />
        </View>

        <Button onPress={handleGetStarted} style={styles.button}>
          Get Started
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
  spacer: {
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  steps: {
    gap: Spacing.xl,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.lg,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  stepContent: {
    flex: 1,
    paddingTop: Spacing.xs,
  },
  stepTitle: {
    marginBottom: Spacing.xs,
  },
  stepDescription: {},
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
    backgroundColor: "#0A3E12",
  },
});
