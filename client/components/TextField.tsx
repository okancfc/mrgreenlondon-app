import React, { forwardRef } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  prefix?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, containerStyle, prefix, style, ...props }, ref) => {
    const { theme } = useTheme();

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
          ]}
        >
          {prefix ? (
            <ThemedText style={styles.prefix}>{prefix}</ThemedText>
          ) : null}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: theme.text },
              prefix ? styles.inputWithPrefix : null,
              style,
            ]}
            placeholderTextColor={theme.textSecondary}
            {...props}
          />
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
  prefix: {
    marginRight: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  inputWithPrefix: {
    paddingLeft: 0,
  },
  error: {
    marginTop: Spacing.xs,
  },
});
