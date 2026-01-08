import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, Pressable, Linking } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { signUp } from "@/lib/auth";
import { upsertProfile } from "@/lib/api";
import { handlePhoneInput, isValidUKPhoneNumber, getCleanPhoneNumber } from "@/lib/phone";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const signUpSchema = z
    .object({
        fullName: z.string().min(2, "Please enter your full name"),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().optional().refine(
            (val) => !val || val === "" || isValidUKPhoneNumber(val),
            "Please enter a valid UK phone number (+44 7XXX XXX XXX)"
        ),
        gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type FormData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { theme, isDark } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGender, setSelectedGender] = useState<string | null>(null);
    const keyboardHeight = useSharedValue(0);

    useKeyboardHandler({
        onMove: (e) => {
            'worklet';
            keyboardHeight.value = withSpring(e.height, {
                damping: 50,
                stiffness: 400,
            });
        },
    });

    const bottomAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: keyboardHeight.value }],
        paddingBottom: insets.bottom + Spacing.lg,
    }));

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            gender: undefined,
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const result = await signUp(data.email, data.password, data.fullName);

            if (result.user) {
                // Create profile in database
                await upsertProfile({
                    id: result.user.id,
                    email: data.email,
                    phone: data.phone || null,
                    full_name: data.fullName,
                    gender: data.gender || null,
                    area: null,
                });

                // Navigate directly to Main screen
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                });
            }
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
                "Sign Up Failed",
                error.message || "Failed to create account. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
            <KeyboardAwareScrollViewCompat
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: insets.top + Spacing["5xl"],
                    },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Image
                        source={isDark ? require("../../assets/images/header-logo-dark.png") : require("../../assets/images/header-logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <ThemedText type="h2" style={styles.title}>
                        Create Account
                    </ThemedText>
                    <ThemedText
                        type="body"
                        style={[styles.subtitle, { color: theme.textSecondary }]}
                    >
                        Sign up to get started with Sir Green
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="fullName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                label="Full Name"
                                placeholder="Your full name"
                                icon="user"
                                autoComplete="name"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.fullName?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                label="Email"
                                placeholder="you@example.com"
                                icon="mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                label="Phone Number (Optional)"
                                placeholder="+44 7XXX XXX XXX"
                                icon="phone"
                                keyboardType="phone-pad"
                                value={value}
                                onChangeText={(text) => onChange(handlePhoneInput(text, value || ""))}
                                onBlur={onBlur}
                                error={errors.phone?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="gender"
                        render={({ field: { onChange } }) => (
                            <View>
                                <ThemedText type="small" style={[{ color: theme.textSecondary, marginBottom: Spacing.sm }]}>
                                    Gender (Optional)
                                </ThemedText>
                                <View style={styles.genderContainer}>
                                    <Pressable
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedGender("male");
                                            onChange("male");
                                        }}
                                        style={[
                                            styles.genderButton,
                                            {
                                                backgroundColor: selectedGender === "male" ? theme.brandGreen + "15" : theme.backgroundDefault,
                                                borderColor: selectedGender === "male" ? theme.brandGreen : theme.border,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={{
                                                color: selectedGender === "male" ? theme.brandGreen : theme.text,
                                                fontWeight: selectedGender === "male" ? "600" : "400",
                                            }}
                                        >
                                            Male
                                        </ThemedText>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedGender("female");
                                            onChange("female");
                                        }}
                                        style={[
                                            styles.genderButton,
                                            {
                                                backgroundColor: selectedGender === "female" ? theme.brandGreen + "15" : theme.backgroundDefault,
                                                borderColor: selectedGender === "female" ? theme.brandGreen : theme.border,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={{
                                                color: selectedGender === "female" ? theme.brandGreen : theme.text,
                                                fontWeight: selectedGender === "female" ? "600" : "400",
                                            }}
                                        >
                                            Female
                                        </ThemedText>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedGender("other");
                                            onChange("other");
                                        }}
                                        style={[
                                            styles.genderButton,
                                            {
                                                backgroundColor: selectedGender === "other" ? theme.brandGreen + "15" : theme.backgroundDefault,
                                                borderColor: selectedGender === "other" ? theme.brandGreen : theme.border,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={{
                                                color: selectedGender === "other" ? theme.brandGreen : theme.text,
                                                fontWeight: selectedGender === "other" ? "600" : "400",
                                            }}
                                        >
                                            Other
                                        </ThemedText>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                label="Password"
                                placeholder="Create a password"
                                icon="lock"
                                secureTextEntry
                                showPasswordToggle
                                autoComplete="new-password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                icon="lock"
                                secureTextEntry
                                showPasswordToggle
                                autoComplete="new-password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.confirmPassword?.message}
                            />
                        )}
                    />

                </View>
            </KeyboardAwareScrollViewCompat>

            {/* Fixed Bottom Section */}
            <Animated.View style={[styles.bottomContainer, { backgroundColor: theme.backgroundRoot, borderTopWidth: 1, borderTopColor: theme.border }, bottomAnimatedStyle]}>
                <ThemedText type="small" style={[styles.legalText, { color: theme.textSecondary }]}>
                    By creating an account, you agree to our{" "}
                    <ThemedText
                        type="small"
                        style={{ color: theme.brandGreen }}
                        onPress={() => Linking.openURL("https://sites.google.com/view/mrgreenlondon/terms-of-use")}
                    >
                        Terms of Use
                    </ThemedText>
                    {" "}and{" "}
                    <ThemedText
                        type="small"
                        style={{ color: theme.brandGreen }}
                        onPress={() => Linking.openURL("https://sites.google.com/view/mrgreenlondon/privacy-policy")}
                    >
                        Privacy Policy
                    </ThemedText>
                </ThemedText>

                <Button
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    style={[styles.button, { backgroundColor: theme.brandGreen }]}
                >
                    {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <View style={styles.signinContainer}>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>
                        Already have an account?{" "}
                    </ThemedText>
                    <Pressable onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate("SignIn");
                    }}>
                        <ThemedText type="body" style={{ color: theme.brandGreen, fontWeight: "600" }}>
                            Sign In
                        </ThemedText>
                    </Pressable>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    header: {
        alignItems: "center",
        marginBottom: Spacing["2xl"],
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: Spacing.lg,
    },
    title: {
        textAlign: "center",
        marginBottom: Spacing.sm,
    },
    subtitle: {
        textAlign: "center",
    },
    form: {
        gap: Spacing.sm,
    },
    genderContainer: {
        flexDirection: "row",
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    genderButton: {
        flex: 1,
        padding: Spacing.md,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: "center",
    },
    signinContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: Spacing.md,
    },
    bottomContainer: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    legalText: {
        textAlign: "center",
        marginBottom: Spacing.lg,
        lineHeight: 18,
    },
    button: {},
});
