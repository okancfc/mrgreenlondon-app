import React, { useState } from "react";
import { View, StyleSheet, Alert, Pressable, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { TextField } from "@/components/TextField";
import { AreaSelector } from "@/components/AreaSelector";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { upsertProfile } from "@/lib/api";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [area, setArea] = useState(profile?.area || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          });
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await upsertProfile({
        id: user.id,
        phone: profile?.phone || user.phone || "",
        full_name: fullName || null,
        area: area || null,
      });
      await refreshProfile();
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenWhatsApp = async () => {
    const url = "https://wa.me/447000000000";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open WhatsApp.");
    }
  };

  const handleOpenEmail = async () => {
    const url = "mailto:support@mrgreen.app";
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", "Failed to open email.");
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.brandGreen + "20" }]}>
            <Feather name="user" size={32} color={theme.brandGreen} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText type="h4">
              {profile?.full_name || "MrGreen User"}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {profile?.phone || user?.phone || "No phone"}
            </ThemedText>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <TextField
              label="Full Name"
              placeholder="Enter your name"
              value={fullName}
              onChangeText={setFullName}
            />
            <ThemedText type="small" style={[styles.areaLabel, { color: theme.textSecondary }]}>
              Area
            </ThemedText>
            <AreaSelector selectedArea={area} onSelectArea={setArea} />
            <View style={styles.editButtons}>
              <Button
                onPress={() => {
                  setIsEditing(false);
                  setFullName(profile?.full_name || "");
                  setArea(profile?.area || "");
                }}
                style={[styles.cancelButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSaveProfile}
                disabled={isSaving}
                style={[styles.saveButton, { backgroundColor: theme.brandGreen }]}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.profileDetails}>
            {profile?.area ? (
              <View style={styles.detailRow}>
                <Feather name="map-pin" size={16} color={theme.textSecondary} />
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  {profile.area} London
                </ThemedText>
              </View>
            ) : null}
            <Pressable
              onPress={() => setIsEditing(true)}
              style={[styles.editButton, { backgroundColor: theme.brandGreen + "15" }]}
            >
              <Feather name="edit-2" size={16} color={theme.brandGreen} />
              <ThemedText style={{ color: theme.brandGreen, fontWeight: "600" }}>
                Edit Profile
              </ThemedText>
            </Pressable>
          </View>
        )}
      </Card>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Support
      </ThemedText>
      <Card style={styles.supportCard}>
        <Pressable style={styles.supportItem} onPress={handleOpenWhatsApp}>
          <View style={[styles.supportIcon, { backgroundColor: "#25D366" + "20" }]}>
            <Feather name="message-circle" size={20} color="#25D366" />
          </View>
          <View style={styles.supportText}>
            <ThemedText type="body">WhatsApp</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Chat with our support team
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Pressable style={styles.supportItem} onPress={handleOpenEmail}>
          <View style={[styles.supportIcon, { backgroundColor: theme.brandGreen + "20" }]}>
            <Feather name="mail" size={20} color={theme.brandGreen} />
          </View>
          <View style={styles.supportText}>
            <ThemedText type="body">Email</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              support@mrgreen.app
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </Card>

      <Button onPress={handleSignOut} style={styles.signOutButton}>
        Sign Out
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    marginBottom: Spacing.xl,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileDetails: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  editForm: {
    gap: Spacing.sm,
  },
  areaLabel: {
    marginBottom: Spacing.xs,
  },
  editButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  supportCard: {
    marginBottom: Spacing["3xl"],
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  supportText: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  signOutButton: {
    backgroundColor: "#DC2626",
  },
});
