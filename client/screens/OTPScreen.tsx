import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { verifyOtp, signInWithPhone } from "@/lib/auth";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/context/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "OTP">;

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { setTestUserLoggedIn } = useAuth();
  const { phone } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit) && newOtp.join("").length === OTP_LENGTH) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    try {
      const result = await verifyOtp(phone, code);

      // Test kullanıcı için AuthContext'i güncelle
      if (result?.user) {
        await setTestUserLoggedIn(result.user);
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (error: any) {
      Alert.alert(
        "Invalid Code",
        error.message || "The code you entered is incorrect. Please try again."
      );
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await signInWithPhone(phone);
      setResendTimer(60);
      Alert.alert("Code Sent", "A new verification code has been sent to your phone.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to resend code.");
    }
  };

  const handleSubmit = () => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH) {
      handleVerify(code);
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
        <ThemedText type="h2" style={styles.title}>
          Verify Your Number
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Enter the 6-digit code sent to {phone}
        </ThemedText>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[
              styles.otpInput,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: digit ? theme.brandGreen : theme.border,
                color: theme.text,
              },
            ]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <Button
        onPress={handleSubmit}
        disabled={isLoading || otp.join("").length < OTP_LENGTH}
        style={styles.button}
      >
        {isLoading ? "Verifying..." : "Verify"}
      </Button>

      <View style={styles.resendContainer}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Didn't receive the code?{" "}
        </ThemedText>
        <Pressable onPress={handleResend} disabled={resendTimer > 0}>
          <ThemedText
            type="body"
            style={{
              color: resendTimer > 0 ? theme.textSecondary : theme.brandGreen,
              fontWeight: "600",
            }}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
          </ThemedText>
        </Pressable>
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
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing["3xl"],
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#0A3E12",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});
