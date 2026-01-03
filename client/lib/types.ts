export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  area: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  icon_key: string | null;
  icon_url: string | null;
  starting_price_label: string | null;
  estimated_duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  is_default: boolean;
  created_at: string;
}

export interface BookingImage {
  id: string;
  booking_id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
}

export type BookingStatus = "requested" | "confirmed" | "completed" | "canceled";

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  address_id: string;
  scheduled_at: string;
  notes: string | null;
  status: BookingStatus;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
  address?: Address;
  images?: BookingImage[];
}

export interface BookingWithDetails extends Booking {
  service: Service;
  address: Address;
}

export const UK_AREAS = [
  { value: "N", label: "North London (N)" },
  { value: "NW", label: "North West London (NW)" },
  { value: "W", label: "West London (W)" },
  { value: "SW", label: "South West London (SW)" },
  { value: "SE", label: "South East London (SE)" },
  { value: "E", label: "East London (E)" },
  { value: "EC", label: "East Central London (EC)" },
  { value: "WC", label: "West Central London (WC)" },
];

export const TIME_WINDOWS = [
  { value: "09:00", label: "9:00 AM - 12:00 PM" },
  { value: "12:00", label: "12:00 PM - 3:00 PM" },
  { value: "15:00", label: "3:00 PM - 6:00 PM" },
];
