import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
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
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

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
                    area: null,
                });

                // Navigate directly to Main screen
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                });
            }
        } catch (error: any) {
            Alert.alert(
                "Sign Up Failed",
                error.message || "Failed to create account. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
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
                        source={require("../../assets/images/header-logo.png")}
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
                        Sign up to get started with MrGreen
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
            </ScrollView>

            {/* Fixed Bottom Section */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
                <Button
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    style={styles.button}
                >
                    {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <View style={styles.signinContainer}>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>
                        Already have an account?{" "}
                    </ThemedText>
                    <Pressable onPress={() => navigation.navigate("SignIn")}>
                        <ThemedText type="body" style={{ color: theme.brandGreen, fontWeight: "600" }}>
                            Sign In
                        </ThemedText>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
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
        width: 80,
        height: 80,
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
    signinContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: Spacing.md,
    },
    bottomContainer: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
    },
    button: {
        backgroundColor: "#0A3E12",
    },
});
