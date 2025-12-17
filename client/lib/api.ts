import { supabase } from "./supabase";
import { Profile, Service, Address, Booking, BookingWithDetails } from "./types";
import { IS_TEST_MODE_ENABLED } from "./auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Local services data for test mode
import servicesData from "../data/services.json";

// AsyncStorage keys for test mode
const TEST_ADDRESSES_KEY = "@test_addresses";
const TEST_BOOKINGS_KEY = "@test_bookings";

// Generate mock services with IDs for test mode
const getMockServices = (): Service[] => {
  return servicesData.map((service, index) => ({
    ...service,
    id: `mock-service-${index + 1}`,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

// Test mode helpers for addresses
async function getTestAddresses(): Promise<Address[]> {
  const data = await AsyncStorage.getItem(TEST_ADDRESSES_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveTestAddresses(addresses: Address[]): Promise<void> {
  await AsyncStorage.setItem(TEST_ADDRESSES_KEY, JSON.stringify(addresses));
}

// Test mode helpers for bookings
async function getTestBookings(): Promise<BookingWithDetails[]> {
  const data = await AsyncStorage.getItem(TEST_BOOKINGS_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveTestBookings(bookings: BookingWithDetails[]): Promise<void> {
  await AsyncStorage.setItem(TEST_BOOKINGS_KEY, JSON.stringify(bookings));
}

export async function getServices(): Promise<Service[]> {
  // Test modunda local JSON'dan servisler yüklenir
  if (IS_TEST_MODE_ENABLED) {
    console.log("🧪 TEST MODE: Servisler local JSON'dan yükleniyor");
    return getMockServices();
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getServiceById(id: string): Promise<Service | null> {
  // Test modunda local JSON'dan servis bulunur
  if (IS_TEST_MODE_ENABLED) {
    const services = getMockServices();
    return services.find(s => s.id === id) || null;
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  // Test modunda mock profil döndür - AuthContext zaten handle ediyor
  if (IS_TEST_MODE_ENABLED) {
    return null; // AuthContext mock profile yönetir
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
  // Test modunda mock profil döndür
  if (IS_TEST_MODE_ENABLED) {
    return {
      id: profile.id,
      phone: profile.phone || "+447777777777",
      full_name: profile.full_name || "Test User",
      area: profile.area || "London",
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAddresses(userId: string): Promise<Address[]> {
  // Test modunda AsyncStorage'dan adresler yüklenir
  if (IS_TEST_MODE_ENABLED) {
    return getTestAddresses();
  }

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  // Test modunda AsyncStorage'dan varsayılan adres yüklenir
  if (IS_TEST_MODE_ENABLED) {
    const addresses = await getTestAddresses();
    return addresses.find(a => a.is_default) || null;
  }

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
  // Test modunda AsyncStorage'a kaydet
  if (IS_TEST_MODE_ENABLED) {
    const addresses = await getTestAddresses();

    // Varsayılan adres işaretlenmişse diğerlerini false yap
    if (address.is_default) {
      addresses.forEach(a => a.is_default = false);
    }

    const newAddress: Address = {
      ...address,
      id: `mock-address-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    addresses.push(newAddress);
    await saveTestAddresses(addresses);
    return newAddress;
  }

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
  // Test modunda AsyncStorage'da güncelle
  if (IS_TEST_MODE_ENABLED) {
    const addresses = await getTestAddresses();
    const index = addresses.findIndex(a => a.id === id);
    if (index !== -1) {
      addresses[index] = { ...addresses[index], ...address };
      await saveTestAddresses(addresses);
      return addresses[index];
    }
    throw new Error("Address not found");
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(address)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBookings(userId: string): Promise<BookingWithDetails[]> {
  // Test modunda AsyncStorage'dan rezervasyonlar yüklenir
  if (IS_TEST_MODE_ENABLED) {
    return getTestBookings();
  }

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
  // Test modunda AsyncStorage'dan rezervasyon bulunur
  if (IS_TEST_MODE_ENABLED) {
    const bookings = await getTestBookings();
    return bookings.find(b => b.id === id) || null;
  }

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
  // Test modunda AsyncStorage'a kaydet
  if (IS_TEST_MODE_ENABLED) {
    const bookings = await getTestBookings();
    const services = getMockServices();
    const addresses = await getTestAddresses();

    const service = services.find(s => s.id === booking.service_id);
    const address = addresses.find(a => a.id === booking.address_id);

    const newBooking: BookingWithDetails = {
      ...booking,
      id: `mock-booking-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: service!,
      address: address!,
    };

    bookings.push(newBooking);
    await saveTestBookings(bookings);
    return newBooking;
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelBooking(id: string, cancelReason?: string): Promise<Booking> {
  // Test modunda AsyncStorage'da güncelle
  if (IS_TEST_MODE_ENABLED) {
    const bookings = await getTestBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index] = {
        ...bookings[index],
        status: "canceled",
        cancel_reason: cancelReason || null,
        updated_at: new Date().toISOString(),
      };
      await saveTestBookings(bookings);
      return bookings[index];
    }
    throw new Error("Booking not found");
  }

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
