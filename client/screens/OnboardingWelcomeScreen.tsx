import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleNext = () => {
    navigation.navigate("OnboardingArea");
  };

  const handleSkip = () => {
    navigation.navigate("OnboardingHowItWorks");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText style={{ color: theme.textSecondary }}>Skip</ThemedText>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={[styles.illustrationContainer, { backgroundColor: theme.brandGreen + "15" }]}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <ThemedText type="h1" style={styles.title}>
          Welcome to MrGreen
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          Book trusted local services in your area. From landscaping to home cleaning, we connect you with verified professionals.
        </ThemedText>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive, { backgroundColor: theme.brandGreen }]} />
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
        </View>

        <Button onPress={handleNext} style={styles.button}>
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
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  illustration: {
    width: 120,
    height: 120,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  description: {
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
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
