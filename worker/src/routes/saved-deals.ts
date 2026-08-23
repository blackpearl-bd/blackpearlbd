import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { createSupabaseAdminClient } from '../lib/supabase';
import { Env } from '../types';

const savedDeals = new Hono();

// List user's saved deals
savedDeals.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { data, error } = await admin
    .from('saved_deals')
    .select(`
      *,
      deal:tour_deals(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch saved deals' }, 500);
  }

  return c.json({ savedDeals: data || [] });
});

// Save a deal
savedDeals.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  if (!body.deal_id) {
    return c.json({ error: 'deal_id is required' }, 400);
  }

  // Check if already saved
  const { data: existing } = await admin
    .from('saved_deals')
    .select('id')
    .eq('user_id', userId)
    .eq('deal_id', body.deal_id)
    .single();

  if (existing) {
    return c.json({ error: 'Deal already saved' }, 409);
  }

  const { data, error } = await admin
    .from('saved_deals')
    .insert({ user_id: userId, deal_id: body.deal_id })
    .select()
    .single();

  if (error) {
    return c.json({ error: 'Failed to save deal' }, 500);
  }

  return c.json({ savedDeal: data }, 201);
});

// Remove from saved
savedDeals.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  const env = c.env as Env;
  const admin = createSupabaseAdminClient(env);

  const { error } = await admin
    .from('saved_deals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return c.json({ error: 'Failed to remove saved deal' }, 500);
  }

  return c.json({ message: 'Deal removed from saved' });
});

export default savedDeals;
