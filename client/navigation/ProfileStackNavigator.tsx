import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import { HeaderLogo } from "@/components/HeaderTitle";
import { HeaderMenuButton } from "@/components/HeaderMenuButton";
import { MenuModal } from "@/components/MenuModal";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ProfileStackParamList = {
  Profile: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerLeft: () => <HeaderLogo />,
            headerTitle: "Profile",
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
