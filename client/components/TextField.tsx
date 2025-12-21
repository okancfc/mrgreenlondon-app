import React, { forwardRef, useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  prefix?: string;
  icon?: keyof typeof Feather.glyphMap;
  showPasswordToggle?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, containerStyle, prefix, icon, showPasswordToggle, style, multiline, secureTextEntry, ...props }, ref) => {
    const { theme } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isSecure = secureTextEntry && !isPasswordVisible;

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <ThemedText
            type="small"
            style={[styles.label, { color: theme.textSecondary }]}
          >
            {label}
          </ThemedText>
        ) : null}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: error ? theme.error : theme.border,
            },
            multiline ? styles.inputContainerMultiline : null,
          ]}
        >
          {icon ? (
            <Feather
              name={icon}
              size={20}
              color={theme.textSecondary}
              style={styles.icon}
            />
          ) : null}
          {prefix ? (
            <ThemedText style={styles.prefix}>{prefix}</ThemedText>
          ) : null}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: theme.text },
              (prefix || icon) ? styles.inputWithPrefix : null,
              multiline ? styles.inputMultiline : null,
              style,
            ]}
            placeholderTextColor={theme.textSecondary}
            multiline={multiline}
            secureTextEntry={isSecure}
            {...props}
          />
          {showPasswordToggle && secureTextEntry ? (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsPasswordVisible(!isPasswordVisible);
              }}
              style={styles.toggleButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          ) : null}
        </View>
        {error ? (
          <ThemedText
            type="small"
            style={[styles.error, { color: theme.error }]}
          >
            {error}
          </ThemedText>
        ) : null}
      </View>
    );
  }
);

TextField.displayName = "TextField";

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
  },
  inputContainerMultiline: {
    height: "auto",
    minHeight: 80,
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  prefix: {
    marginRight: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  inputMultiline: {
    height: "auto",
    minHeight: 60,
    textAlignVertical: "top",
    paddingTop: 0,
  },
  inputWithPrefix: {
    paddingLeft: 0,
  },
  toggleButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  error: {
    marginTop: Spacing.xs,
  },
});
