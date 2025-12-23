import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ONBOARDING_COMPLETED: "@sirgreen:onboarding_completed",
  SELECTED_AREA: "@sirgreen:selected_area",
};

export async function getOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, String(completed));
}

export async function getSelectedArea(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.SELECTED_AREA);
  } catch {
    return null;
  }
}

export async function setSelectedArea(area: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.SELECTED_AREA, area);
}

export async function clearStorage(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.ONBOARDING_COMPLETED,
    KEYS.SELECTED_AREA,
  ]);
}
