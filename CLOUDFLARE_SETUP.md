# Cloudflare Deployment Setup

Your code is pushed to `blackpearl-bd/blackpearlbd`. Configure these in the Cloudflare dashboard:

---

## 1. Cloudflare Pages (Frontend)

Go to **Cloudflare Dashboard → Pages → Create/Configure project**

| Setting | Value |
|---------|-------|
| **Repository** | `blackpearl-bd/blackpearlbd` |
| **Branch** | `master` |
| **Root directory** | `web` |
| **Build command** | `npm install && npm run build` |
| **Build output directory** | `dist` |
| **Node.js version** | `18` (set in environment variable `NODE_VERSION=18`) |

### Environment Variables (set in Pages settings)

```
VITE_SUPABASE_URL=https://lichnzimdpnmofvigtfg.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_API_URL=<your-worker-url>
```

Get your Supabase keys:
```bash
cd blackpearl && supabase status
```

---

## 2. Cloudflare Workers (API)

Go to **Cloudflare Dashboard → Workers & Pages → Create/Configure project**

| Setting | Value |
|---------|-------|
| **Repository** | `blackpearl-bd/blackpearlbd` |
| **Branch** | `master` |
| **Root directory** | `worker` |

### Environment Variables (set in Worker settings)

```
SUPABASE_URL=https://lichnzimdpnmofvigtfg.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

**Important**: Add `VITE_API_URL` value (your worker's `.workers.dev` URL) to Supabase's **Authentication → Settings → Redirect URLs** and **API → Settings → CORS origins**.

---

## 3. Supabase Auth Configuration

1. Go to **Supabase Dashboard → Authentication → Providers → Google**
2. Enable Google OAuth
3. Add your **Client ID** and **Client Secret** from Google Cloud Console
4. Set **Site URL** to your Cloudflare Pages URL
5. Add redirect URLs:
   - `https://<your-pages-url>/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

6. Go to **API → Settings → CORS origins**
7. Add:
   - `https://<your-pages-url>`
   - `https://<your-worker-url>`
