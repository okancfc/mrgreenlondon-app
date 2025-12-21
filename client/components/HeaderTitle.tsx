import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function HeaderLogo() {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={isDark ? require("../../assets/images/header-logo-dark.png") : require("../../assets/images/header-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 36,
  },
});
