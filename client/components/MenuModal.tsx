import React from "react";
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface MenuModalProps {
    visible: boolean;
    onClose: () => void;
}

interface MenuItem {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    onPress: () => void;
}

export function MenuModal({ visible, onClose }: MenuModalProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const menuItems: MenuItem[] = [
        {
            icon: "home",
            label: "Ana Sayfa",
            onPress: () => {
                onClose();
            },
        },
        {
            icon: "calendar",
            label: "Rezervasyonlarım",
            onPress: () => {
                onClose();
            },
        },
        {
            icon: "user",
            label: "Profilim",
            onPress: () => {
                onClose();
            },
        },
        {
            icon: "settings",
            label: "Ayarlar",
            onPress: () => {
                onClose();
            },
        },
        {
            icon: "help-circle",
            label: "Yardım & Destek",
            onPress: () => {
                onClose();
            },
        },
        {
            icon: "info",
            label: "Hakkında",
            onPress: () => {
                onClose();
            },
        },
    ];

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
                        Menü
                    </ThemedText>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x-circle" size={28} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + Spacing.xl },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                { backgroundColor: theme.backgroundDefault },
                            ]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: theme.brandGreen }]}>
                                <Feather name={item.icon} size={20} color="#FFFFFF" />
                            </View>
                            <ThemedText type="body" style={styles.menuLabel}>
                                {item.label}
                            </ThemedText>
                            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ))}
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
        alignItems: "flex-end",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        gap: Spacing.sm,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        alignItems: "center",
        justifyContent: "center",
        marginRight: Spacing.lg,
    },
    menuLabel: {
        flex: 1,
    },
});
