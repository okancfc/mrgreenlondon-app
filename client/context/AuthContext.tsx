import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import { getProfile, upsertProfile } from "@/lib/api";
import { clearStorage, getOnboardingCompleted, getSelectedArea } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setOnboardingComplete: (complete: boolean) => void;
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
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();

      // Handle invalid refresh token error (various formats)
      if (error && (
        error.message?.toLowerCase().includes('refresh token') ||
        error.message?.toLowerCase().includes('refresh_token') ||
        error.name === 'AuthApiError'
      )) {
        console.warn('Invalid refresh token detected, clearing session:', error.message);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear invalid session on any auth error
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsLoading(false);
    }

    // Listen for auth state changes
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

  const checkOnboarding = async () => {
    const completed = await getOnboardingCompleted();
    setIsOnboardingComplete(completed);
  };

  const loadProfile = async (user: User) => {
    try {
      let userProfile = await getProfile(user.id);

      if (!userProfile) {
        const area = await getSelectedArea();
        const fullName = user.user_metadata?.full_name || null;

        userProfile = await upsertProfile({
          id: user.id,
          email: user.email || null,
          phone: user.phone || null,
          full_name: fullName,
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
