import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView, Pressable, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { AreaSelector } from "@/components/AreaSelector";
import { ImagePickerSection } from "@/components/ImagePickerSection";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getServiceById, getDefaultAddress, createAddress, createBooking, upsertProfile, uploadBookingImage } from "@/lib/api";
import { Service, Address, TIME_WINDOWS } from "@/lib/types";
import { queryClient } from "@/lib/query-client";
import { handlePhoneInput, isValidUKPhoneNumber } from "@/lib/phone";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "Booking">;

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  company: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      "Please enter a valid UK postcode"
    ),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => isValidUKPhoneNumber(val),
      "Please enter a valid UK phone number (+44 7XXX XXX XXX)"
    ),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof addressSchema>;

const STEPS = ["Address", "Schedule", "Review"];

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { user, profile, refreshProfile } = useAuth();

  const { serviceId, serviceName } = route.params;

  const [step, setStep] = useState(0);
  const [service, setService] = useState<Service | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(getDefaultDate());
  const [selectedTimeWindow, setSelectedTimeWindow] = useState(TIME_WINDOWS[0].value);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      line1: "",
      line2: "",
      company: "",
      city: "London",
      postcode: "",
      phone: "",
      notes: "",
    },
  });

  function getDefaultDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [serviceData, addressData] = await Promise.all([
        getServiceById(serviceId),
        user?.id ? getDefaultAddress(user.id) : null,
      ]);

      setService(serviceData);
      setDefaultAddress(addressData);

      if (addressData) {
        setValue("line1", addressData.line1);
        setValue("line2", addressData.line2 || "");
        setValue("company", addressData.company || "");
        setValue("city", addressData.city);
        setValue("postcode", addressData.postcode);
      }

      // Auto-fill phone from profile
      if (profile?.phone) {
        setValue("phone", profile.phone);
      }

      // Auto-fill area from profile
      if (profile?.area) {
        setSelectedArea(profile.area);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      const newDate = new Date(date);
      const [hours] = selectedTimeWindow.split(":").map(Number);
      newDate.setHours(hours, 0, 0, 0);
      setSelectedDate(newDate);
    }
  };

  const handleTimeWindowChange = (timeWindow: string) => {
    setSelectedTimeWindow(timeWindow);
    const [hours] = timeWindow.split(":").map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, 0, 0, 0);
    setSelectedDate(newDate);
  };

  const handleConfirmBooking = async (data: FormData) => {
    if (!user?.id || !service) return;

    setIsSubmitting(true);
    try {
      const newAddress = await createAddress({
        user_id: user.id,
        line1: data.line1,
        line2: data.line2 || null,
        company: data.company || null,
        city: data.city,
        postcode: data.postcode.toUpperCase(),
        is_default: !defaultAddress,
      });

      const newBooking = await createBooking({
        user_id: user.id,
        service_id: service.id,
        address_id: newAddress.id,
        scheduled_at: selectedDate.toISOString(),
        notes: data.notes || null,
        status: "requested",
        cancel_reason: null,
      });

      // Upload images if any
      if (selectedImages.length > 0) {
        await Promise.all(
          selectedImages.map((imageUri) =>
            uploadBookingImage(user.id, newBooking.id, imageUri)
          )
        );
      }

      // Save phone and area to profile for future bookings
      if (selectedArea || data.phone) {
        await upsertProfile({
          id: user.id,
          email: profile?.email || user.email || null,
          phone: data.phone || profile?.phone || null,
          full_name: profile?.full_name || null,
          area: selectedArea || profile?.area || null,
        });
        await refreshProfile();
      }

      await queryClient.invalidateQueries({ queryKey: ["bookings"] });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Booking Confirmed",
        "Your booking has been submitted successfully. We will confirm your appointment soon.",
        [
          {
            text: "View Bookings",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Main",
                    state: {
                      routes: [
                        { name: "BookingsTab" }
                      ],
                    },
                  },
                ],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getTimeWindowLabel = (value: string): string => {
    return TIME_WINDOWS.find((tw) => tw.value === value)?.label || value;
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Step {step + 1} of {STEPS.length}
      </ThemedText>
      <View style={styles.stepDots}>
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              {
                backgroundColor: index <= step ? theme.brandGreen : theme.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h3" style={styles.stepTitle}>
        Delivery Address
      </ThemedText>
      <ThemedText type="body" style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Where should we provide the service?
      </ThemedText>

      <Controller
        control={control}
        name="line1"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Address Line 1 *"
            placeholder="123 Example Street"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.line1?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="line2"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Address Line 2"
            placeholder="Flat, suite, unit (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="company"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Company"
            placeholder="Company name (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="City *"
            placeholder="London"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.city?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="postcode"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Postcode *"
            placeholder="SW1A 1AA"
            value={value}
            onChangeText={(text) => onChange(text.toUpperCase())}
            onBlur={onBlur}
            error={errors.postcode?.message}
            autoCapitalize="characters"
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Phone Number *"
            placeholder="+44 7XXX XXX XXX"
            icon="phone"
            value={value}
            onChangeText={(text) => onChange(handlePhoneInput(text, value || ""))}
            onBlur={onBlur}
            error={errors.phone?.message}
            keyboardType="phone-pad"
          />
        )}
      />

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: Spacing.md }]}>
        Service Area *
      </ThemedText>
      <AreaSelector selectedArea={selectedArea} onSelectArea={setSelectedArea} />

      <Button
        onPress={handleSubmit(handleNext)}
        disabled={!selectedArea}
        style={[styles.nextButton, { backgroundColor: theme.brandGreen }]}
      >
        Continue
      </Button>
    </View>
  );

  const renderScheduleStep = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h3" style={styles.stepTitle}>
        Choose Date & Time
      </ThemedText>
      <ThemedText type="body" style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        When would you like the service?
      </ThemedText>

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Select Date
      </ThemedText>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowDatePicker(true);
        }}
        style={[styles.dateButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <Feather name="calendar" size={20} color={theme.brandGreen} />
        <ThemedText>{formatDate(selectedDate)}</ThemedText>
      </Pressable>

      {showDatePicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      ) : null}

      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Preferred Time Window
      </ThemedText>
      <View style={styles.timeWindows}>
        {TIME_WINDOWS.map((tw) => (
          <Pressable
            key={tw.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleTimeWindowChange(tw.value);
            }}
            style={[
              styles.timeWindowButton,
              {
                backgroundColor:
                  selectedTimeWindow === tw.value
                    ? theme.brandGreen + "15"
                    : theme.backgroundDefault,
                borderColor:
                  selectedTimeWindow === tw.value ? theme.brandGreen : theme.border,
              },
            ]}
          >
            <ThemedText
              style={{
                color: selectedTimeWindow === tw.value ? theme.brandGreen : theme.text,
                fontWeight: selectedTimeWindow === tw.value ? "600" : "400",
              }}
            >
              {tw.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Additional Notes (optional)"
            placeholder="Any special instructions for our team..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: "top" }}
          />
        )}
      />

      <ImagePickerSection
        images={selectedImages}
        onImagesChange={setSelectedImages}
        maxImages={5}
      />

      <Button
        onPress={handleNext}
        style={[styles.nextButton, { backgroundColor: theme.brandGreen }]}
      >
        Review Booking
      </Button>
    </View>
  );

  const renderReviewStep = () => {
    const formData = getValues();
    return (
      <View style={styles.stepContent}>
        <ThemedText type="h3" style={styles.stepTitle}>
          Review Your Booking
        </ThemedText>
        <ThemedText type="body" style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          Please confirm the details below
        </ThemedText>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Feather name="tool" size={20} color={theme.brandGreen} />
            <View style={styles.summaryContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Service
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {serviceName}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryRow}>
            <Feather name="map-pin" size={20} color={theme.brandGreen} />
            <View style={styles.summaryContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Address
              </ThemedText>
              <ThemedText type="body">
                {formData.line1}
                {formData.line2 ? `, ${formData.line2}` : ""}
              </ThemedText>
              {formData.company && (
                <ThemedText type="body">{formData.company}</ThemedText>
              )}
              <ThemedText type="body">
                {formData.city}, {formData.postcode}
              </ThemedText>
              {selectedArea && (
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  {selectedArea} London
                </ThemedText>
              )}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryRow}>
            <Feather name="calendar" size={20} color={theme.brandGreen} />
            <View style={styles.summaryContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Date & Time
              </ThemedText>
              <ThemedText type="body">{formatDate(selectedDate)}</ThemedText>
              <ThemedText type="body">{getTimeWindowLabel(selectedTimeWindow)}</ThemedText>
            </View>
          </View>

          {formData.notes ? (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.summaryRow}>
                <Feather name="file-text" size={20} color={theme.brandGreen} />
                <View style={styles.summaryContent}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Notes
                  </ThemedText>
                  <ThemedText type="body">{formData.notes}</ThemedText>
                </View>
              </View>
            </>
          ) : null}

          {selectedImages.length > 0 ? (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.summaryRow}>
                <Feather name="camera" size={20} color={theme.brandGreen} />
                <View style={styles.summaryContent}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Photos ({selectedImages.length})
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.reviewImagesContainer}
                  >
                    {selectedImages.map((uri, index) => (
                      <Image
                        key={index}
                        source={{ uri }}
                        style={styles.reviewImage}
                      />
                    ))}
                  </ScrollView>
                </View>
              </View>
            </>
          ) : null}
        </Card>

        <Button
          onPress={handleSubmit(handleConfirmBooking)}
          disabled={isSubmitting}
          style={[styles.confirmButton, { backgroundColor: theme.brandGreen }]}
        >
          {isSubmitting ? "Confirming..." : "Confirm Booking"}
        </Button>
      </View>
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">{serviceName}</ThemedText>
        <View style={styles.spacer} />
      </View>

      {renderStepIndicator()}

      {step === 0 && renderAddressStep()}
      {step === 1 && renderScheduleStep()}
      {step === 2 && renderReviewStep()}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  spacer: {
    width: 40,
  },
  stepIndicator: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  stepDots: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  timeWindows: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  timeWindowButton: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
  nextButton: {
    marginTop: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  summaryContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  confirmButton: {
    marginTop: Spacing.md,
  },
  reviewImagesContainer: {
    marginTop: Spacing.sm,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
});
