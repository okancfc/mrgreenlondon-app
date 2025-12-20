import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookingsScreen from "@/screens/BookingsScreen";
import { HeaderLogo } from "@/components/HeaderTitle";
import { HeaderMenuButton } from "@/components/HeaderMenuButton";
import { MenuModal } from "@/components/MenuModal";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type BookingsStackParamList = {
  Bookings: undefined;
};

const Stack = createNativeStackNavigator<BookingsStackParamList>();

export default function BookingsStackNavigator() {
  const screenOptions = useScreenOptions();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Bookings"
          component={BookingsScreen}
          options={{
            headerLeft: () => <HeaderLogo />,
            headerTitle: "My Bookings",
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
