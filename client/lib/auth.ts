import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================
// TEST CREDENTIALS - REMOVE BEFORE PRODUCTION
// ============================================
const TEST_PHONE_NUMBER = "+447777777777"; // Test numara: 7777777777
const TEST_OTP_CODE = "123456";
export const IS_TEST_MODE_ENABLED = true; // Gerçek numaralar için false yapın
const TEST_USER_KEY = "@test_user";

// Mock test user - Supabase User tipine benzer
export const TEST_USER = {
  id: "test-user-id-12345",
  phone: TEST_PHONE_NUMBER,
  email: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: { phone: TEST_PHONE_NUMBER },
};
// ============================================

// Test kullanıcıyı AsyncStorage'a kaydet
export async function setTestUser() {
  await AsyncStorage.setItem(TEST_USER_KEY, JSON.stringify(TEST_USER));
}

// Test kullanıcıyı AsyncStorage'dan getir
export async function getTestUser() {
  const user = await AsyncStorage.getItem(TEST_USER_KEY);
  return user ? JSON.parse(user) : null;
}

// Test kullanıcıyı AsyncStorage'dan sil
export async function clearTestUser() {
  await AsyncStorage.removeItem(TEST_USER_KEY);
}

export async function signInWithPhone(phone: string) {
  // Test numara için SMS göndermeyi atla
  if (IS_TEST_MODE_ENABLED && phone === TEST_PHONE_NUMBER) {
    console.log("🧪 TEST MODE: SMS gönderme atlandı, test numarası kullanılıyor");
    return { messageId: "test-message-id" };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: "sms",
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function verifyOtp(phone: string, token: string) {
  // Test numara ve kod için doğrulamayı atla
  if (IS_TEST_MODE_ENABLED && phone === TEST_PHONE_NUMBER && token === TEST_OTP_CODE) {
    console.log("🧪 TEST MODE: OTP doğrulama başarılı, mock kullanıcı oluşturuluyor");

    // Mock kullanıcıyı kaydet
    await setTestUser();

    return {
      user: TEST_USER,
      session: {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
        token_type: "bearer",
        user: TEST_USER,
      },
    };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  // Test modunda test kullanıcıyı temizle
  if (IS_TEST_MODE_ENABLED) {
    await clearTestUser();
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  // Test modunda önce test kullanıcıyı kontrol et
  if (IS_TEST_MODE_ENABLED) {
    const testUser = await getTestUser();
    if (testUser) {
      return testUser;
    }
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

export async function getCurrentSession() {
  // Test modunda test kullanıcı varsa mock session döndür
  if (IS_TEST_MODE_ENABLED) {
    const testUser = await getTestUser();
    if (testUser) {
      return {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
        token_type: "bearer",
        user: testUser,
      };
    }
  }

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}
