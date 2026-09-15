# Cloudflare Deployment Setup

Your code is pushed to `november-saiful/blackpearlbd`. Configure these in the Cloudflare dashboard:

---

## 1. Cloudflare Pages (Frontend)

Go to **Cloudflare Dashboard → Pages → Create/Configure project**

| Setting | Value |
|---------|-------|
| **Repository** | `november-saiful/blackpearlbd` |
| **Branch** | `main` |
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

There is no `VITE_GEOAPIFY_API_KEY` any more — the Geoapify key is a Worker
secret (see the Workers section below), so it is never bundled into the
frontend.

Get your Supabase keys:
```bash
cd blackpearl && supabase status
```

---

## 2. Cloudflare Workers (API)

Go to **Cloudflare Dashboard → Workers & Pages → Create/Configure project**

| Setting | Value |
|---------|-------|
| **Repository** | `november-saiful/blackpearlbd` |
| **Branch** | `master` |
| **Root directory** | `worker` |

### Environment Variables (set in Worker settings)

```
SUPABASE_URL=https://lichnzimdpnmofvigtfg.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
GEOAPIFY_API_KEY=<your-geoapify-api-key>
```

`GEOAPIFY_API_KEY` powers the admin deal form's place search, route generation
and pin snapping. Locally add it to `worker/.dev.vars`; in production set it
with:

```bash
cd worker && npx wrangler secret put GEOAPIFY_API_KEY
```

**Important**: Add `VITE_API_URL` value (your worker's `.workers.dev` URL) to Supabase's **Authentication → Settings → Redirect URLs** and **API → Settings → CORS origins**.

### Custom domain for the API (recommended)

Serving the API from a real domain on the `blackpearl.bd` zone is worth doing for
two reasons:

1. **It is the only way the edge cache works.** Cloudflare's Cache API is a
documented no-op on `*.workers.dev` — and a silent one, so it looks like it
succeeds while caching nothing. The `/geo` read-through cache falls back to
in-isolate memory on workers.dev, but the shared, cross-request layer needs a
custom domain.
2. **Canonical API host.** `workers.dev` is fine for a prototype but not for a
   production API URL.

**How to attach it** — add a Custom Domain in the dashboard: *Workers & Pages →
blackpearl-api → Settings → Domains & Routes → Add → Custom Domain →
`api.blackpearl.bd`*. Cloudflare creates the DNS record for you. This needs no
CLI permissions and stays attached across deploys.

The `wrangler.toml` equivalent is:

```toml
routes = [{ pattern = "api.blackpearl.bd", custom_domain = true }]
```

It is left commented out there because a route attach needs `Zone:DNS:Edit`,
and the cached `wrangler login` token only carries `zone (read)` — an
unauthorised route fails the entire deploy, not just the domain attachment. If
you prefer config-as-code, re-run `npx wrangler login` to grant DNS edit first.

**After attaching it:**

1. Point the frontend at it — set the Pages build variable `VITE_API_URL` to
   `https://api.blackpearl.bd` and redeploy Pages.
2. Confirm the edge cache is live:
   ```bash
   curl https://api.blackpearl.bd/geo/cache-stats
   ```
   `edge.probe` should read `"working"` (it reads `"not-storing"` on
   workers.dev) and `customDomain` should be `true`.
3. Keep `workers.dev` enabled. Every image URL already stored in the database
   points at it, so disabling it would break existing deal photos. New uploads
   now mint URLs on whichever host served the upload, so they follow the custom
   domain automatically.

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
