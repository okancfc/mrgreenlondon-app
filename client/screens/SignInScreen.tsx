import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, Pressable } from "react-native";
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
import { signIn } from "@/lib/auth";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof signInSchema>;

export default function SignInScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            await signIn(data.email, data.password);
            navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
            });
        } catch (error: any) {
            Alert.alert(
                "Sign In Failed",
                error.message || "Invalid email or password. Please try again."
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
                    source={require("../../assets/images/header-logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <ThemedText type="h2" style={styles.title}>
                    Welcome Back
                </ThemedText>
                <ThemedText
                    type="body"
                    style={[styles.subtitle, { color: theme.textSecondary }]}
                >
                    Sign in to your account to continue
                </ThemedText>
            </View>

            <View style={styles.form}>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextField
                            label="Email"
                            placeholder="you@example.com"
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
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextField
                            label="Password"
                            placeholder="Enter your password"
                            secureTextEntry
                            autoComplete="password"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.password?.message}
                        />
                    )}
                />

                <Button
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    style={styles.button}
                >
                    {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                <View style={styles.signupContainer}>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>
                        Don't have an account?{" "}
                    </ThemedText>
                    <Pressable onPress={() => navigation.navigate("SignUp")}>
                        <ThemedText type="body" style={{ color: theme.brandGreen, fontWeight: "600" }}>
                            Create Account
                        </ThemedText>
                    </Pressable>
                </View>
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
        marginBottom: Spacing["3xl"],
    },
    logo: {
        width: 100,
        height: 100,
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
        gap: Spacing.md,
    },
    button: {
        marginTop: Spacing.md,
        backgroundColor: "#0A3E12",
    },
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: Spacing.xl,
    },
});
