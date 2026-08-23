import { Context, Next } from 'hono';

export const corsMiddleware = async (c: Context, next: Next) => {
  const origin = c.req.header('Origin') || '*';
  
  // Set CORS headers
  c.header('Access-Control-Allow-Origin', origin);
  c.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
};
