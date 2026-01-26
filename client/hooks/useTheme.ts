import { Colors } from "@/constants/theme";

export function useTheme() {
  // Always use light theme - dark mode disabled
  const isDark = false;
  const theme = Colors.light;

  return {
    theme,
    isDark,
  };
}
