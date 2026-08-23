import { Hono } from 'hono';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { CreateDealSchema } from '../lib/validators';
import { createSupabaseAdminClient } from '../lib/supabase';
import { Env } from '../types';

const deals = new Hono();

// List all active deals (public)
deals.get('/', async (c) => {
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data, error } = await admin
    .from('tour_deals')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch deals' }, 500);
  }

  return c.json({ deals: data || [] });
});

// Get single deal details
deals.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data, error } = await admin
    .from('tour_deals')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return c.json({ error: 'Deal not found' }, 404);
  }

  return c.json({ deal: data });
});

// Create new deal (admin only)
deals.post('/', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const result = CreateDealSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.issues }, 400);
  }

  const profile = c.get('profile');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data, error } = await admin
    .from('tour_deals')
    .insert({ ...result.data, created_by: profile.id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: 'A deal with this slug already exists' }, 409);
    }
    return c.json({ error: 'Failed to create deal' }, 500);
  }

  return c.json({ deal: data }, 201);
});

// Update deal (admin only)
deals.patch('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data, error } = await admin
    .from('tour_deals')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ error: 'Failed to update deal' }, 500);
  }

  return c.json({ deal: data });
});

// Soft delete deal (admin only)
deals.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { error } = await admin
    .from('tour_deals')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return c.json({ error: 'Failed to delete deal' }, 500);
  }

  return c.json({ message: 'Deal deleted successfully' });
});

export default deals;
