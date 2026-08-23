import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono();

// Verify current session, return user + profile
auth.get('/session', authMiddleware, async (c) => {
  const profile = c.get('profile');
  return c.json({ user: { id: profile.id }, profile });
});

// Sign out
auth.post('/logout', async (c) => {
  return c.json({ message: 'Logged out successfully' });
});

export default auth;
