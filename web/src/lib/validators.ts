import { z } from 'zod';

export const ProfileEditSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s-]{10,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type ProfileEditValues = z.infer<typeof ProfileEditSchema>;

export const PackageBuilderSchema = z.object({
  destinationId: z.string().uuid('Please select a destination'),
  travelDate: z.string().min(1, 'Please select a travel date'),
  numTravelers: z
    .number({ invalid_type_error: 'Number of travelers is required' })
    .int()
    .min(1, 'At least 1 traveler required')
    .max(50, 'Maximum 50 travelers'),
  accommodationType: z.enum(['budget', 'standard', 'luxury'], {
    required_error: 'Please select accommodation type',
  }),
  transportType: z.enum(['flight', 'bus', 'train', 'self'], {
    required_error: 'Please select transport type',
  }),
  budget: z
    .number({ invalid_type_error: 'Budget is required' })
    .positive('Budget must be greater than zero'),
  activities: z.array(z.string()),
  specialRequests: z.string().max(2000).optional(),
});

export type PackageBuilderValues = z.infer<typeof PackageBuilderSchema>;
