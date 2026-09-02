export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  pearls: number;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface TourDeal {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  destination: string;
  price: number;
  original_price: number | null;
  duration_days: number;
  max_travelers: number | null;
  image_url: string | null;
  gallery: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  is_active: boolean;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface CustomPackage {
  id: string;
  user_id: string;
  title: string | null;
  destination_id: string | null;
  budget: number | null;
  travel_date: string | null;
  num_travelers: number;
  accommodation_type: string | null;
  transport_type: string | null;
  activities: string[];
  special_requests: string | null;
  estimated_price: number | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user?: { full_name: string; email: string };
}

export interface Booking {
  id: string;
  user_id: string;
  booking_type: string;
  deal_id: string | null;
  custom_package_id: string | null;
  status: string;
  total_amount: number;
  traveler_details: Record<string, unknown>;
  invoice_number: string | null;
  invoice_url: string | null;
  payment_status: string;
  booked_at: string;
  updated_at: string;
  deal?: TourDeal;
  custom_package?: CustomPackage;
  user?: { full_name: string; email: string };
}

export interface SavedDeal {
  id: string;
  user_id: string;
  deal_id: string;
  created_at: string;
  deal?: TourDeal;
}

export interface PearlsHistory {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  booking_id: string | null;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  parent_id: string | null;
  type: string;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  children?: Destination[];
}

export interface ProfileStats {
  pearls: number;
  status: string;
  totalTours: number;
  pendingBookings: number;
}

export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
}

export interface PackageDestination {
  id: string;
  category: string;
  name: string;
  value: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface PackageDistrict {
  id: string;
  division_value: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface PackageTourSpot {
  id: string;
  district_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  district?: { name: string; division_value: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
