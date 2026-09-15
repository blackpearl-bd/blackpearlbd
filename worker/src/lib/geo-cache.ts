/**
 * Two-layer read-through cache for the /geo proxy.
 *
 * Layer 1 — isolate memory. Each Worker isolate serves many requests for the
 * duration of its life, and the repeated calls all come from one admin iterating
 * on a deal: a search retyped with different spacing, or the same pin reverse
 * geocoded again while snapping a route.
 *
 * Layer 2 — Cloudflare's edge cache (`caches.default`), shared across all
 * requests hitting the same data centre. Note this layer is only functional when
 * the Worker is served from a **custom domain**: on `*.workers.dev` cache
 * operations are documented no-ops, which is why layer 1 carries the load there.
 * Every edge call is wrapped so an inoperative or failing cache simply means a
 * miss, never a failed request.
 *
 * Routing responses are deliberately not cached: a polyline for the Dhaka →
 * Cox's Bazar leg measured ~3000 coordinates, and every distinct waypoint set is
 * one entry. They would displace far more valuable entries from layer 1 and rarely
 * repeat.
 */

const MEMO_LIMIT = 500;

const memo = new Map<string, { expiresAt: number; value: unknown }>();

export type GeoCacheSource = 'isolate' | 'edge' | 'origin';

/** The cached endpoints. `route` is absent: routing responses are not cached. */
export type GeoCacheNamespace = 'search' | 'reverse';

interface CounterSet {
  requests: number;
  isolateHits: number;
  edgeHits: number;
  misses: number;
}

const counters = new Map<GeoCacheNamespace, CounterSet>();
const startedAt = Date.now();

function counterFor(namespace: GeoCacheNamespace): CounterSet {
  let entry = counters.get(namespace);
  if (!entry) {
    entry = { requests: 0, isolateHits: 0, edgeHits: 0, misses: 0 };
    counters.set(namespace, entry);
  }
  return entry;
}

function memoGet<T>(key: string): T | undefined {
  const entry = memo.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    memo.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function memoSet(key: string, value: unknown, ttlSeconds: number) {
  if (memo.size >= MEMO_LIMIT) {
    // Map iterates in insertion order, so the first key is the oldest entry.
    const oldest = memo.keys().next().value;
    if (oldest !== undefined) memo.delete(oldest);
  }
  memo.set(key, { expiresAt: Date.now() + ttlSeconds * 1000, value });
}

/**
 * `caches.default` is the Cloudflare-specific default cache. It is missing
 * outside the Workers runtime (local scripts) and its typings live outside the
 * standard CacheStorage interface, hence the cast.
 */
function edgeCache(): Cache | null {
  try {
    if (typeof caches === 'undefined') return null;
    return (caches as unknown as { default?: Cache }).default ?? null;
  } catch {
    return null;
  }
}

async function edgeGet<T>(key: Request): Promise<T | undefined> {
  const cache = edgeCache();
  if (!cache) return undefined;
  try {
    const hit = await cache.match(key);
    if (!hit) return undefined;
    return (await hit.json()) as T;
  } catch (error) {
    console.warn('Geo edge cache read failed:', error);
    return undefined;
  }
}

async function edgePut(key: Request, value: unknown, ttlSeconds: number) {
  const cache = edgeCache();
  if (!cache) return;
  try {
    await cache.put(
      key,
      new Response(JSON.stringify(value), {
        headers: {
          'content-type': 'application/json',
          // cache.put() takes the TTL from the response's Cache-Control.
          'cache-control': `public, max-age=${ttlSeconds}`,
        },
      }),
    );
  } catch (error) {
    console.warn('Geo edge cache write failed:', error);
  }
}

/**
 * Returns the cached value for `keyUrl` if there is one, otherwise runs
 * `produce` and stores the result in both layers. The source is reported back so
 * routes can expose it as `X-Geo-Cache` and a hit rate can be confirmed from the
 * network tab.
 */
export async function readThroughCache<T>(
  namespace: GeoCacheNamespace,
  keyUrl: string,
  ttlSeconds: number,
  produce: () => Promise<T>,
): Promise<{ value: T; source: GeoCacheSource }> {
  const counter = counterFor(namespace);
  counter.requests += 1;

  const fromMemo = memoGet<T>(keyUrl);
  if (fromMemo !== undefined) {
    counter.isolateHits += 1;
    return { value: fromMemo, source: 'isolate' };
  }

  // A key without request headers, so two admins (and two sessions) share one
  // entry instead of caching per Authorization token.
  const key = new Request(keyUrl, { method: 'GET' });

  const fromEdge = await edgeGet<T>(key);
  if (fromEdge !== undefined) {
    counter.edgeHits += 1;
    memoSet(keyUrl, fromEdge, ttlSeconds);
    return { value: fromEdge, source: 'edge' };
  }

  counter.misses += 1;
  const value = await produce();
  memoSet(keyUrl, value, ttlSeconds);
  await edgePut(key, value, ttlSeconds);
  return { value, source: 'origin' };
}

/**
 * Whether Cloudflare's edge cache actually stores and returns a value for this
 * Worker. The Cache API is a documented no-op on `*.workers.dev`, and worse, a
 * silent one — a put/match pair "succeeds" while caching nothing. The only
 * trustworthy answer is a round trip, which is what this probe does.
 */
async function probeEdgeCache(originUrl: string): Promise<'working' | 'not-storing' | 'unavailable'> {
  const cache = edgeCache();
  if (!cache) return 'unavailable';

  const key = new Request(new URL('/__geo-cache/__probe', originUrl).toString(), { method: 'GET' });
  try {
    await cache.put(
      key,
      new Response(JSON.stringify({ probedAt: Date.now() }), {
        headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' },
      }),
    );
    return (await cache.match(key)) ? 'working' : 'not-storing';
  } catch (error) {
    console.warn('Geo edge cache probe failed:', error);
    return 'not-storing';
  }
}

export interface GeoCacheStatsSnapshot {
  hostname: string;
  /** True when the request was served from a domain other than *.workers.dev. */
  customDomain: boolean;
  uptimeSeconds: number;
  isolate: { entries: number; limit: number };
  edge: { capable: boolean; probe: string };
  totals: CounterSet & { savedUpstreamCalls: number };
  byNamespace: Record<string, CounterSet>;
  note: string;
}

/**
 * Counters are per isolate, so this describes the isolate that answered — treat
 * it as a live sample, not a fleet-wide total.
 */
export async function geoCacheStats(requestUrl: string): Promise<GeoCacheStatsSnapshot> {
  const { hostname } = new URL(requestUrl);

  const totals: CounterSet = { requests: 0, isolateHits: 0, edgeHits: 0, misses: 0 };
  const byNamespace: Record<string, CounterSet> = {};

  for (const [namespace, count] of counters) {
    byNamespace[namespace] = { ...count };
    totals.requests += count.requests;
    totals.isolateHits += count.isolateHits;
    totals.edgeHits += count.edgeHits;
    totals.misses += count.misses;
  }

  return {
    hostname,
    customDomain: !hostname.endsWith('.workers.dev'),
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    isolate: { entries: memo.size, limit: MEMO_LIMIT },
    edge: { capable: edgeCache() !== null, probe: await probeEdgeCache(requestUrl) },
    totals: { ...totals, savedUpstreamCalls: totals.isolateHits + totals.edgeHits },
    byNamespace,
    note:
      'Per-isolate counters: isolates are short-lived and there are many, so short-lived ad-hoc reads are expected to show small numbers. The edge probe is the authoritative check that the Cloudflare cache is active.',
  };
}
