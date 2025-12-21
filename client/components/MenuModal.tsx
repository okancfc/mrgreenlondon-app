import React from "react";
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface MenuModalProps {
    visible: boolean;
    onClose: () => void;
}

interface MenuItem {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    subtitle?: string;
    onPress: () => void;
}

export function MenuModal({ visible, onClose }: MenuModalProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const handleOpenEmail = async () => {
        const email = "support@mrgreen.app";
        const url = `mailto:${email}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        }
        onClose();
    };

    const handleOpenWhatsApp = async () => {
        const url = "https://wa.me/447000000000";
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        }
        onClose();
    };

    const handleOpenPrivacyPolicy = async () => {
        const url = "https://sites.google.com/view/mrgreenlondon/privacy-policy";
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        }
        onClose();
    };

    const handleOpenTerms = async () => {
        const url = "https://sites.google.com/view/mrgreenlondon/terms-of-use";
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        }
        onClose();
    };

    const handleOpenAbout = async () => {
        const url = "https://www.mrgreenlondon.com/";
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="formSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <View style={styles.headerLeft} />
                    <ThemedText type="h4" style={styles.headerTitle}>
                        Menu
                    </ThemedText>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + Spacing.xl },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Support Section */}
                    <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                        SUPPORT
                    </ThemedText>
                    <Card style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleOpenWhatsApp}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: "#25D366" + "15" }]}>
                                <Feather name="message-circle" size={20} color="#25D366" />
                            </View>
                            <View style={styles.menuItemContent}>
                                <ThemedText type="body">WhatsApp</ThemedText>
                                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                                    Chat with us
                                </ThemedText>
                            </View>
                            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleOpenEmail}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: theme.brandGreen + "15" }]}>
                                <Feather name="mail" size={20} color={theme.brandGreen} />
                            </View>
                            <View style={styles.menuItemContent}>
                                <ThemedText type="body">Email</ThemedText>
                                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                                    support@mrgreen.app
                                </ThemedText>
                            </View>
                            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </Card>

                    {/* About & Legal Section */}
                    <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                        ABOUT & LEGAL
                    </ThemedText>
                    <Card style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleOpenAbout}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: theme.brandGreen + "15" }]}>
                                <Feather name="info" size={20} color={theme.brandGreen} />
                            </View>
                            <View style={styles.menuItemContent}>
                                <ThemedText type="body">About MrGreen</ThemedText>
                                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                                    Version 1.0.0
                                </ThemedText>
                            </View>
                            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleOpenPrivacyPolicy}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: theme.brandGreen + "15" }]}>
                                <Feather name="shield" size={20} color={theme.brandGreen} />
                            </View>
                            <View style={styles.menuItemContent}>
                                <ThemedText type="body">Privacy Policy</ThemedText>
                            </View>
                            <Feather name="external-link" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleOpenTerms}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: theme.brandGreen + "15" }]}>
                                <Feather name="file-text" size={20} color={theme.brandGreen} />
                            </View>
                            <View style={styles.menuItemContent}>
                                <ThemedText type="body">Terms of Use</ThemedText>
                            </View>
                            <Feather name="external-link" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </Card>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
                            © 2024 MrGreen London
                        </ThemedText>
                        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
                            Professional Garden Services
                        </ThemedText>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
    },
    headerLeft: {
        width: 40,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    sectionLabel: {
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    sectionCard: {
        marginBottom: Spacing.xl,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        alignItems: "center",
        justifyContent: "center",
        marginRight: Spacing.md,
    },
    menuItemContent: {
        flex: 1,
    },
    divider: {
        height: 1,
        marginLeft: 56,
    },
    footer: {
        marginTop: Spacing.xl,
        alignItems: "center",
        gap: Spacing.xs,
    },
});
