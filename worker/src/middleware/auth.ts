import { Context, Next } from 'hono';
import { createSupabaseClient, getUserFromToken } from '../lib/supabase';
import { Env, Profile } from '../types';

// Extend Hono context to include user and profile
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    profile: Profile;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const env = c.env as Env;
  const supabase = createSupabaseClient(env);
  
  const user = await getUserFromToken(supabase, token);
  if (!user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Fetch profile from database using service role to bypass RLS
  const { createSupabaseAdminClient } = await import('../lib/supabase');
  const admin = createSupabaseAdminClient(env);
  const { data: profile, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  c.set('userId', user.id);
  c.set('profile', profile as Profile);
  
  await next();
};

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    await next();
    return;
  }

  const token = authHeader.split(' ')[1];
  const env = c.env as Env;
  const supabase = createSupabaseClient(env);
  
  const user = await getUserFromToken(supabase, token);
  if (!user) {
    await next();
    return;
  }

  const { createSupabaseAdminClient } = await import('../lib/supabase');
  const admin = createSupabaseAdminClient(env);
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    c.set('userId', user.id);
    c.set('profile', profile as Profile);
  }

  await next();
};
