import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { UpdateProfileSchema } from '../lib/validators';
import { createSupabaseAdminClient } from '../lib/supabase';
import { Env } from '../types';

const profile = new Hono();

// Get current user profile
profile.get('/', authMiddleware, async (c) => {
  const profileData = c.get('profile');
  return c.json({ profile: profileData });
});

// Update profile (phone, address, full_name)
profile.patch('/', authMiddleware, async (c) => {
  const body = await c.req.json();
  const result = UpdateProfileSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.issues }, 400);
  }

  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);
  
  const { error } = await admin
    .from('profiles')
    .update({ ...result.data, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return c.json({ error: 'Failed to update profile' }, 500);
  }

  const { data: updatedProfile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return c.json({ profile: updatedProfile });
});

// Get profile stats
profile.get('/stats', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  // Get pearls and status
  const { data: profileData } = await admin
    .from('profiles')
    .select('pearls, status')
    .eq('id', userId)
    .single();

  // Get approved bookings count
  const { count: totalTours } = await admin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'approved');

  // Get pending bookings count
  const { count: pendingBookings } = await admin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['pending', 'processing']);

  return c.json({
    pearls: profileData?.pearls || 0,
    status: profileData?.status || 'bronze',
    totalTours: totalTours || 0,
    pendingBookings: pendingBookings || 0,
  });
});

// Get approved tours (past, present, upcoming)
profile.get('/tours', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data: bookings, error } = await admin
    .from('bookings')
    .select(`
      *,
      deal:tour_deals(*),
      custom_package:custom_packages(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'approved')
    .order('booked_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch tours' }, 500);
  }

  return c.json({ tours: bookings || [] });
});

// Get pending/processing/rejected bookings
profile.get('/pending', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data: bookings, error } = await admin
    .from('bookings')
    .select(`
      *,
      deal:tour_deals(*),
      custom_package:custom_packages(*)
    `)
    .eq('user_id', userId)
    .in('status', ['pending', 'processing', 'rejected', 'cancelled'])
    .order('booked_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }

  return c.json({ bookings: bookings || [] });
});

// Get pearls history
profile.get('/pearls', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data: history, error } = await admin
    .from('pearls_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch pearls history' }, 500);
  }

  return c.json({ history: history || [] });
});

export default profile;
