import { supabase } from "./supabase";

// ============================================
// Email/Password Authentication
// ============================================

export interface AuthResult {
  user: any;
  session: any;
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

/**
 * Reset password (send reset email)
 */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    throw error;
  }
}

/**
 * Delete current user's account and all related data
 * This calls a Supabase RPC function that handles cascade deletion
 */
export async function deleteAccount(): Promise<void> {
  // First delete user data via RPC (profiles, addresses, bookings)
  const { error: rpcError } = await supabase.rpc("delete_user_account");

  if (rpcError) {
    throw rpcError;
  }

  // Then sign out
  await signOut();
}
