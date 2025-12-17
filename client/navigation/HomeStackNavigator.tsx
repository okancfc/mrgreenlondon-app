import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import { HeaderLogo } from "@/components/HeaderTitle";
import { HeaderMenuButton } from "@/components/HeaderMenuButton";
import { MenuModal } from "@/components/MenuModal";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type HomeStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const screenOptions = useScreenOptions();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerLeft: () => <HeaderLogo />,
            headerTitle: "",
            headerRight: () => (
              <HeaderMenuButton onPress={() => setMenuVisible(true)} />
            ),
          }}
        />
      </Stack.Navigator>
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

