import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import PhoneAuthScreen from "@/screens/PhoneAuthScreen";
import OTPScreen from "@/screens/OTPScreen";
import BookingScreen from "@/screens/BookingScreen";
import BookingDetailScreen from "@/screens/BookingDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  OTP: { phone: string };
  Main: { screen?: string } | undefined;
  Booking: { serviceId: string; serviceName: string };
  BookingDetail: { bookingId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading, isOnboardingComplete } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isOnboardingComplete) {
      return "Onboarding";
    }
    if (!user) {
      return "Auth";
    }
    return "Main";
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={getInitialRoute()}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="Auth"
        component={PhoneAuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
