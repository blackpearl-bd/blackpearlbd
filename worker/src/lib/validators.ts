import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[+]?[0-9\s-]{10,20}$/).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
});

export const CreateDealSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  short_description: z.string().max(300).optional(),
  destination: z.string().min(2),
  price: z.number().positive(),
  original_price: z.number().positive().optional(),
  duration_days: z.number().int().positive(),
  max_travelers: z.number().int().positive().optional(),
  image_url: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
  })).optional(),
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
