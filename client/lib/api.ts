import { supabase } from "./supabase";
import { Profile, Service, Address, Booking, BookingWithDetails } from "./types";

// ============================================
// Services
// ============================================

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Profiles
// ============================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Addresses
// ============================================

export async function getAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createAddress(address: Omit<Address, "id" | "created_at">): Promise<Address> {
  if (address.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", address.user_id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert(address)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAddress(id: string, address: Partial<Address>): Promise<Address> {
  const { data, error } = await supabase
    .from("addresses")
    .update(address)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Bookings
// ============================================

export async function getBookings(userId: string): Promise<BookingWithDetails[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      service:services(*),
      address:addresses(*)
    `)
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBookingById(id: string): Promise<BookingWithDetails | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      service:services(*),
      address:addresses(*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBooking(booking: Omit<Booking, "id" | "created_at" | "updated_at">): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelBooking(id: string, cancelReason?: string): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "canceled",
      cancel_reason: cancelReason || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
