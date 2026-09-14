import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { Env } from '../types';

const upload = new Hono();

// Allowed image types and max size
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Upload image to R2 (admin only)
upload.post('/image', authMiddleware, adminMiddleware, async (c) => {
  const env = c.env as Env;

  if (!env.BLACKPEARL_BUCKET) {
    return c.json({ error: 'Storage not configured' }, 500);
  }

  const contentType = c.req.header('content-type') || '';

  // Handle multipart form data
  if (contentType.includes('multipart/form-data')) {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF' }, 400);
    }

    if (file.size > MAX_SIZE) {
      return c.json({ error: 'File too large. Maximum size: 5MB' }, 400);
    }

    // Generate unique filename: deals/{timestamp}-{random}.{ext}
    const ext = file.name.split('.').pop() || 'jpg';
    const random = Math.random().toString(36).substring(2, 8);
    const key = `deals/${Date.now()}-${random}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    await env.BLACKPEARL_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    // Return the URL served through this Worker
    const publicUrl = `https://blackpearl-api.ms-blackpearlbd.workers.dev/upload/image/${key}`;

    return c.json({ url: publicUrl, key });
  }

  return c.json({ error: 'Unsupported content type. Use multipart/form-data.' }, 400);
});

// Serve image from R2 (public)
// NOTE: Hono does NOT support Express-style multi-segment params like "/:key+";
// that pattern only ever matched a single segment, so nested keys such as
// "deals/1694…-abc123.webp" returned 404. Use a wildcard and parse the key
// from the request path instead.
function imageKeyFromPath(path: string): string {
  const match = path.match(/^\/upload\/image\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

upload.get('/image/*', async (c) => {
  const env = c.env as Env;
  const key = imageKeyFromPath(new URL(c.req.url).pathname);

  if (!key) {
    return c.json({ error: 'Image key required' }, 400);
  }

  if (!env.BLACKPEARL_BUCKET) {
    return c.json({ error: 'Storage not configured' }, 500);
  }

  const object = await env.BLACKPEARL_BUCKET.get(key);

  if (!object) {
    return c.json({ error: 'Image not found' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
});

// Delete image from R2 (admin only)
upload.delete('/image/*', authMiddleware, adminMiddleware, async (c) => {
  const env = c.env as Env;
  const key = imageKeyFromPath(new URL(c.req.url).pathname);

  if (!key) {
    return c.json({ error: 'Image key required' }, 400);
  }

  if (!env.BLACKPEARL_BUCKET) {
    return c.json({ error: 'Storage not configured' }, 500);
  }

  await env.BLACKPEARL_BUCKET.delete(key);

  return c.json({ message: 'Image deleted' });
});

export default upload;
