import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import { getProfile, upsertProfile } from "@/lib/api";
import { clearStorage, getOnboardingCompleted, getSelectedArea } from "@/lib/storage";
import { getTestUser, IS_TEST_MODE_ENABLED, clearTestUser } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setOnboardingComplete: (complete: boolean) => void;
  setTestUserLoggedIn: (user: any) => void; // Test modu için
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    checkOnboarding();
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    // Test modunda önce test kullanıcıyı kontrol et
    if (IS_TEST_MODE_ENABLED) {
      const testUser = await getTestUser();
      if (testUser) {
        console.log("🧪 TEST MODE: Test kullanıcı bulundu, giriş yapılıyor");
        setUser(testUser as User);
        setSession({
          access_token: "test-access-token",
          refresh_token: "test-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: testUser,
        } as Session);
        await loadTestProfile(testUser);
        return;
      }
    }

    // Normal Supabase auth kontrolü
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
    if (session?.user) {
      loadProfile(session.user);
    } else {
      setIsLoading(false);
    }

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  };

  // Test kullanıcı için mock profil yükle
  const loadTestProfile = async (testUser: any) => {
    try {
      const area = await getSelectedArea();
      const mockProfile: Profile = {
        id: testUser.id,
        phone: testUser.phone,
        full_name: "Test User",
        area: area || "London",
        created_at: new Date().toISOString(),
      };
      setProfile(mockProfile);
    } catch (error) {
      console.error("Error loading test profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test kullanıcı giriş yaptığında çağrılacak
  const setTestUserLoggedIn = async (testUser: any) => {
    setUser(testUser as User);
    setSession({
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      expires_in: 3600,
      token_type: "bearer",
      user: testUser,
    } as Session);
    await loadTestProfile(testUser);
  };

  const checkOnboarding = async () => {
    const completed = await getOnboardingCompleted();
    setIsOnboardingComplete(completed);
  };

  const loadProfile = async (user: User) => {
    try {
      let userProfile = await getProfile(user.id);

      if (!userProfile && user.phone) {
        const area = await getSelectedArea();
        userProfile = await upsertProfile({
          id: user.id,
          phone: user.phone,
          area,
        });
      }

      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await clearStorage();
    setProfile(null);
    setIsOnboardingComplete(false);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isOnboardingComplete,
    signOut: handleSignOut,
    refreshProfile,
    setOnboardingComplete: setIsOnboardingComplete,
    setTestUserLoggedIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
