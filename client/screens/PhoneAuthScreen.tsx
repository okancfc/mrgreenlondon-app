import React, { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { signInWithPhone } from "@/lib/auth";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(11, "Please enter a valid phone number")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
});

type FormData = z.infer<typeof phoneSchema>;

export default function PhoneAuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const fullPhone = `+44${data.phone.replace(/^0/, "")}`;
      await signInWithPhone(fullPhone);
      navigation.navigate("OTP", { phone: fullPhone });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h2" style={styles.title}>
          Enter Your Phone Number
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          We will send you a verification code via SMS
        </ThemedText>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Phone Number"
              prefix="+44"
              placeholder="7123456789"
              keyboardType="phone-pad"
              autoComplete="tel"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              maxLength={11}
            />
          )}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          style={styles.button}
        >
          {isLoading ? "Sending..." : "Send Code"}
        </Button>

        <ThemedText
          type="small"
          style={[styles.disclaimer, { color: theme.textSecondary }]}
        >
          By continuing, you agree to receive SMS messages. Standard rates may apply.
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: Spacing.md,
    backgroundColor: "#1F7A3B",
  },
  disclaimer: {
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
