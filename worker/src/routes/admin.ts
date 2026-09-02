import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { UpdateBookingStatusSchema, UpdateCustomPackageStatusSchema, UpdateAdminUserSchema } from '../lib/validators';
import { createSupabaseAdminClient } from '../lib/supabase';
import { Env } from '../types';

const admin = new Hono();

// Dashboard stats
admin.get('/stats', authMiddleware, adminMiddleware, async (c) => {
  const env = c.env as Env;
  const adminClient = createSupabaseAdminClient(env);

  // Total users
  const { count: totalUsers } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Total bookings
  const { count: totalBookings } = await adminClient
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Total revenue (approved bookings)
  const { data: revenueData } = await adminClient
    .from('bookings')
    .select('total_amount')
    .eq('status', 'approved');

  const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

  // Pending approvals
  const { count: pendingApprovals } = await adminClient
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Recent bookings (last 10)
  const { data: recentBookings } = await adminClient
    .from('bookings')
    .select(`
      *,
      user:profiles(full_name, email),
      deal:tour_deals(title, destination),
      custom_package:custom_packages(title, destination_id)
    `)
    .order('booked_at', { ascending: false })
    .limit(10);

  return c.json({
    stats: {
      totalUsers: totalUsers || 0,
      totalBookings: totalBookings || 0,
      totalRevenue,
      pendingApprovals: pendingApprovals || 0,
    },
    recentBookings: recentBookings || [],
  });
});

// List all users with pagination
admin.get('/users', authMiddleware, adminMiddleware, async (c) => {
  const env = c.env as Env;
  const adminClient = createSupabaseAdminClient(env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const search = c.req.query('search') || '';
  const offset = (page - 1) * limit;

  let query = adminClient
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }

  return c.json({
    users: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
});

// List all bookings with filters
admin.get('/bookings', authMiddleware, adminMiddleware, async (c) => {
  const env = c.env as Env;
  const adminClient = createSupabaseAdminClient(env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const status = c.req.query('status');
  const type = c.req.query('type');
  const offset = (page - 1) * limit;

  let query = adminClient
    .from('bookings')
    .select(`
      *,
      user:profiles(full_name, email),
      deal:tour_deals(title, destination),
      custom_package:custom_packages(title)
    `, { count: 'exact' })
    .order('booked_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (type) {
    query = query.eq('booking_type', type);
  }

  const { data, count, error } = await query;

  if (error) {
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }

  return c.json({
    bookings: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
});

// Update booking status
admin.patch('/bookings/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = UpdateBookingStatusSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.issues }, 400);
  }

  const env = c.env as Env;
  const adminClient = createSupabaseAdminClient(env);

  const updateData: Record<string, unknown> = {
    status: result.data.status,
    updated_at: new Date().toISOString(),
  };
  if (result.data.admin_notes !== undefined) {
    updateData.admin_notes = result.data.admin_notes;
  }

  const { data, error } = await adminClient
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ error: 'Failed to update booking' }, 500);
  }

  return c.json({ booking: data });
});

// List all custom packages
admin.get('/custom-packages', authMiddleware, adminMiddleware, async (c) => {
  const env = c.env as Env;
  const adminClient = createSupabaseAdminClient(env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const { data, count, error } = await adminClient
    .from('custom_packages')
    .select(`
      *,
      user:profiles(full_name, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: 'Failed to fetch custom packages' }, 500);
  }

  return c.json({
    customPackages: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
});

// Update custom package status
admin.patch('/custom-packages/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = UpdateCustomPackageStatusSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.issues }, 400);
  }

  const env = c.env as Env;
  const adminClient = createSupabaseAdminClient(env);

  const updateData: Record<string, unknown> = {
    status: result.data.status,
    updated_at: new Date().toISOString(),
  };
  if (result.data.admin_notes !== undefined) {
    updateData.admin_notes = result.data.admin_notes;
  }
  if (result.data.estimated_price !== undefined) {
    updateData.estimated_price = result.data.estimated_price;
  }

  const { data, error } = await adminClient
    .from('custom_packages')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ error: 'Failed to update custom package' }, 500);
  }

  return c.json({ customPackage: data });
});

// Update user (role, status, pearls, name)
admin.patch('/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = UpdateAdminUserSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.issues }, 400);
  }

  const env = c.env as Env;
  const adminClient = createSupabaseAdminClient(env);

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (result.data.full_name !== undefined) updateData.full_name = result.data.full_name;
  if (result.data.role !== undefined) updateData.role = result.data.role;
  if (result.data.status !== undefined) updateData.status = result.data.status;
  if (result.data.pearls !== undefined) updateData.pearls = result.data.pearls;

  const { data, error } = await adminClient
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ error: 'Failed to update user' }, 500);
  }

  return c.json({ user: data });
});

// Delete user
admin.delete('/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const requestingUserId = c.get('userId');

  // Prevent admin from deleting themselves
  if (requestingUserId === id) {
    return c.json({ error: 'Cannot delete your own account' }, 400);
  }

  const env = c.env as Env;
  const adminClient = createSupabaseAdminClient(env);

  const { error } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) {
    return c.json({ error: 'Failed to delete user' }, 500);
  }

  return c.json({ success: true });
});

export default admin;
