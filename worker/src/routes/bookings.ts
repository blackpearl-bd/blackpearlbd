import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { CreateBookingSchema } from '../lib/validators';
import { createSupabaseAdminClient } from '../lib/supabase';
import { Env } from '../types';

const bookings = new Hono();

// Create booking (for deals)
bookings.post('/', authMiddleware, async (c) => {
  const body = await c.req.json();
  const result = CreateBookingSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.issues }, 400);
  }

  if (result.data.booking_type === 'deal' && !result.data.deal_id) {
    return c.json({ error: 'deal_id is required for deal bookings' }, 400);
  }

  if (result.data.booking_type === 'custom' && !result.data.custom_package_id) {
    return c.json({ error: 'custom_package_id is required for custom bookings' }, 400);
  }

  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  // Generate invoice number
  const invoiceNumber = `BKP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const { data, error } = await admin
    .from('bookings')
    .insert({
      user_id: userId,
      booking_type: result.data.booking_type,
      deal_id: result.data.deal_id || null,
      custom_package_id: result.data.custom_package_id || null,
      total_amount: result.data.total_amount,
      traveler_details: result.data.traveler_details,
      invoice_number: invoiceNumber,
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: 'Failed to create booking' }, 500);
  }

  return c.json({ booking: data }, 201);
});

// List user's bookings
bookings.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data, error } = await admin
    .from('bookings')
    .select(`
      *,
      deal:tour_deals(*),
      custom_package:custom_packages(*)
    `)
    .eq('user_id', userId)
    .order('booked_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }

  return c.json({ bookings: data || [] });
});

// Generate invoice data
bookings.get('/:id/invoice', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data: booking, error } = await admin
    .from('bookings')
    .select(`
      *,
      deal:tour_deals(*),
      custom_package:custom_packages(*),
      user:profiles(full_name, email, phone)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !booking) {
    return c.json({ error: 'Booking not found' }, 404);
  }

  return c.json({ invoice: booking });
});

export default bookings;
