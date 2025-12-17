import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface HeaderMenuButtonProps {
    onPress: () => void;
}

export function HeaderMenuButton({ onPress }: HeaderMenuButtonProps) {
    const { theme } = useTheme();

    return (
        <Pressable
            style={styles.button}
            onPress={onPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Feather name="menu" size={24} color={theme.text} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 4,
    },
});
