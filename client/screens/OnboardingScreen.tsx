import React, { useState, useRef } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    Dimensions,
    Animated,
    Image,
    Pressable,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { AreaSelector } from "@/components/AreaSelector";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { setSelectedArea, setOnboardingCompleted } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const howItWorksSteps = [
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

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { setOnboardingComplete } = useAuth();

    const [currentPage, setCurrentPage] = useState(0);
    const [selectedAreaValue, setSelectedAreaValue] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const TOTAL_PAGES = 3;

    const handleNext = async () => {
        if (currentPage < TOTAL_PAGES - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentPage + 1,
                animated: true,
            });
        } else {
            // Last page - complete onboarding
            if (selectedAreaValue) {
                await setSelectedArea(selectedAreaValue);
            }
            await setOnboardingCompleted(true);
            setOnboardingComplete(true);
            navigation.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
            });
        }
    };

    const handleSkip = async () => {
        await setOnboardingCompleted(true);
        setOnboardingComplete(true);
        navigation.reset({
            index: 0,
            routes: [{ name: "SignIn" }],
        });
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.x;
        const page = Math.round(offset / SCREEN_WIDTH);
        setCurrentPage(page);
    };

    const getButtonText = () => {
        if (currentPage === TOTAL_PAGES - 1) {
            return "Get Started";
        }
        return "Next";
    };

    const isNextDisabled = () => {
        // On area selection page (page 1), require area to be selected
        if (currentPage === 1 && !selectedAreaValue) {
            return true;
        }
        return false;
    };

    // Page 1: Welcome
    const renderWelcomePage = () => (
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
            <View style={styles.pageContent}>
                <View style={[styles.illustrationContainer, { backgroundColor: theme.brandGreen + "15" }]}>
                    <Image
                        source={require("../../assets/images/header-logo.png")}
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
        </View>
    );

    // Page 2: Area Selection
    const renderAreaPage = () => (
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
            <View style={styles.areaPageContent}>
                <ThemedText type="h2" style={styles.title}>
                    Choose Your Area
                </ThemedText>

                <ThemedText
                    type="body"
                    style={[styles.description, { color: theme.textSecondary }]}
                >
                    Select your London area to find services available near you.
                </ThemedText>

                <ScrollView
                    style={styles.areaScrollView}
                    contentContainerStyle={styles.areaScrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    nestedScrollEnabled={true}
                >
                    <AreaSelector
                        selectedArea={selectedAreaValue}
                        onSelectArea={setSelectedAreaValue}
                    />
                </ScrollView>
            </View>
        </View>
    );

    // Page 3: How It Works
    const renderHowItWorksPage = () => (
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
            <View style={styles.howItWorksContent}>
                <ThemedText type="h2" style={styles.title}>
                    How It Works
                </ThemedText>

                <View style={styles.steps}>
                    {howItWorksSteps.map((step, index) => (
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
        </View>
    );

    const pages = [
        { key: "welcome", render: renderWelcomePage },
        { key: "area", render: renderAreaPage },
        { key: "howItWorks", render: renderHowItWorksPage },
    ];

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {pages.map((_, index) => {
                const inputRange = [
                    (index - 1) * SCREEN_WIDTH,
                    index * SCREEN_WIDTH,
                    (index + 1) * SCREEN_WIDTH,
                ];

                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 24, 8],
                    extrapolate: "clamp",
                });

                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.5, 1, 0.5],
                    extrapolate: "clamp",
                });

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                width: dotWidth,
                                opacity,
                                backgroundColor: theme.brandGreen,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
            {/* Header with Skip button */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
                <View style={styles.headerSpacer} />
                <Pressable onPress={handleSkip} style={styles.skipButton}>
                    <ThemedText style={{ color: theme.textSecondary }}>Skip</ThemedText>
                </Pressable>
            </View>

            {/* Scrollable Pages */}
            <FlatList
                ref={flatListRef}
                data={pages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => item.render()}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* Fixed Footer with Dots and Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
                {renderDots()}

                <Button
                    onPress={handleNext}
                    style={styles.button}
                    disabled={isNextDisabled()}
                >
                    {getButtonText()}
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
    headerSpacer: {
        width: 48,
    },
    skipButton: {
        padding: Spacing.sm,
    },
    page: {
        flex: 1,
    },
    pageContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Spacing["3xl"],
    },
    areaPageContent: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
    },
    areaScrollView: {
        flex: 1,
    },
    areaScrollContent: {
        paddingBottom: Spacing.xl,
    },
    howItWorksContent: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing["3xl"],
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
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    button: {
        backgroundColor: "#0A3E12",
    },
});
