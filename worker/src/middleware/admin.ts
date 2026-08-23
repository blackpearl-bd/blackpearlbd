import { Context, Next } from 'hono';

export const adminMiddleware = async (c: Context, next: Next) => {
  const profile = c.get('profile');
  
  if (!profile || profile.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  await next();
};
