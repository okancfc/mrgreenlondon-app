import React from "react";
import { View, StyleSheet, Pressable, Image, ScrollView, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ImagePickerSectionProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
}

export function ImagePickerSection({
    images,
    onImagesChange,
    maxImages = 5,
}: ImagePickerSectionProps) {
    const { theme } = useTheme();

    const requestPermissions = async () => {
        if (Platform.OS !== "web") {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (cameraStatus !== "granted" || libraryStatus !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Please allow camera and photo library access to add images."
                );
                return false;
            }
        }
        return true;
    };

    const pickImage = async (useCamera: boolean) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: 0.7,
            allowsMultipleSelection: !useCamera,
            selectionLimit: maxImages - images.length,
        };

        try {
            let result;
            if (useCamera) {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets.length > 0) {
                const newImages = result.assets.map((asset) => asset.uri);
                const updatedImages = [...images, ...newImages].slice(0, maxImages);
                onImagesChange(updatedImages);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image. Please try again.");
        }
    };

    const showImageOptions = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
            "Add Photo",
            "Choose an option",
            [
                { text: "Take Photo", onPress: () => pickImage(true) },
                { text: "Choose from Library", onPress: () => pickImage(false) },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const removeImage = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Remove Photo",
            "Are you sure you want to remove this photo?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        const updatedImages = images.filter((_, i) => i !== index);
                        onImagesChange(updatedImages);
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.labelContainer}>
                    <Feather name="camera" size={18} color={theme.brandGreen} />
                    <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                        Property Photos (Optional)
                    </ThemedText>
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {images.length}/{maxImages}
                </ThemedText>
            </View>

            <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
                Add photos of your garden/property to help us understand the job better
            </ThemedText>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {images.map((uri, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri }} style={styles.image} />
                        <Pressable
                            onPress={() => removeImage(index)}
                            style={[styles.removeButton, { backgroundColor: theme.backgroundDefault }]}
                        >
                            <Feather name="x" size={16} color="#DC2626" />
                        </Pressable>
                    </View>
                ))}

                {images.length < maxImages && (
                    <Pressable
                        onPress={showImageOptions}
                        style={[
                            styles.addButton,
                            {
                                backgroundColor: theme.backgroundDefault,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <Feather name="plus" size={28} color={theme.brandGreen} />
                        <ThemedText type="small" style={{ color: theme.textSecondary }}>
                            Add Photo
                        </ThemedText>
                    </Pressable>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.xl,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.xs,
    },
    labelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    label: {
        fontWeight: "500",
    },
    hint: {
        marginBottom: Spacing.md,
        lineHeight: 18,
    },
    scrollContent: {
        gap: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.sm,
    },
    removeButton: {
        position: "absolute",
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    addButton: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        gap: Spacing.xs,
    },
});
