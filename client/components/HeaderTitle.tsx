import React from "react";
import { View, StyleSheet, Image } from "react-native";

export function HeaderLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/header-logo.png")}
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
