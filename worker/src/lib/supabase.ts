import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Env } from '../types';

export function createSupabaseClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

export function createSupabaseAdminClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Extract user from JWT token
 * This verifies the token using Supabase's built-in verification
 */
export async function getUserFromToken(
  supabase: SupabaseClient,
  token: string
) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
