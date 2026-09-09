import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[+]?[0-9\s-]{10,20}$/).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
});

// Helper: treat empty strings, 0, null, and undefined as "not provided"
function optionalClean() {
  return z.any().transform((v) => {
    if (v === '' || v === null || v === undefined || v === 0) return undefined;
    return v;
  });
}

const WaypointSchema = z.object({
  name: z.string().min(1).max(200),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
});

const RouteGeometrySchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number().finite(), z.number().finite()])).min(2),
});

export const CreateDealSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  short_description: optionalClean().pipe(z.string().max(300).optional()),
  destination: z.string().min(2),
  price: z.coerce.number().positive(),
  original_price: optionalClean().pipe(z.coerce.number().positive().optional()),
  duration_days: z.coerce.number().int().positive(),
  max_travelers: optionalClean().pipe(z.coerce.number().int().positive().optional()),
  image_url: optionalClean().pipe(z.string().url().optional()),
  gallery: z.array(z.string().url()).optional().default([]).transform(v => v && v.length > 0 ? v : undefined),
  inclusions: z.array(z.string()).optional().default([]).transform(v => v && v.length > 0 ? v : undefined),
  exclusions: z.array(z.string()).optional().default([]).transform(v => v && v.length > 0 ? v : undefined),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  route_waypoints: z.array(WaypointSchema).max(50).nullable().optional(),
  // Generated once in the admin form and persisted for public, routing-free rendering.
  route_geometry: RouteGeometrySchema.nullable().optional(),
  is_featured: z.boolean().optional(),
});

export const CreateCustomPackageSchema = z.object({
  title: z.string().max(200).optional(),
  destination_id: z.string().uuid(),
  budget: z.number().positive(),
  travel_date: z.string(),
  num_travelers: z.number().int().min(1).max(50),
  accommodation_type: z.enum(['budget', 'standard', 'luxury']),
  transport_type: z.enum(['flight', 'bus', 'train', 'self']),
  activities: z.array(z.string()).optional(),
  special_requests: z.string().max(2000).optional(),
});

export const CreateBookingSchema = z.object({
  booking_type: z.enum(['deal', 'custom']),
  deal_id: z.string().uuid().optional(),
  custom_package_id: z.string().uuid().optional(),
  total_amount: z.number().positive(),
  traveler_details: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    emergency_contact: z.string().optional(),
  }),
});

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'approved', 'rejected', 'cancelled']),
  admin_notes: z.string().optional(),
});

export const UpdateCustomPackageStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'approved', 'rejected']),
  admin_notes: z.string().optional(),
  estimated_price: z.number().positive().optional(),
});

export const UpdateAdminUserSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['bronze', 'platinum', 'gold', 'diamond']).optional(),
  pearls: z.number().int().min(0).optional(),
});

export const CreatePackageDestinationSchema = z.object({
  category: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  value: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const UpdatePackageDestinationSchema = z.object({
  category: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  value: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});
