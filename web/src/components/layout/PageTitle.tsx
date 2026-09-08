import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SITE_NAME = 'BlackPearl';
const SITE_URL = 'https://blackpearl.bd';

// ── Hand-authored per-page SEO metadata for the public routes ──────────

const PAGE_META: Record<string, {
  title: string;
  description: string;
  ogType?: 'website' | 'product' | 'article';
}> = {
  '/': {
    title: 'BlackPearl — Curated Tour Deals & Custom Travel Packages',
    description:
      'BlackPearl brings you curated tour deals and custom packages to the world\'s most amazing destinations. Browse discounted tours or build your own trip.',
    ogType: 'website',
  },
  '/deals': {
    title: 'Tour Deals — BlackPearl',
    description:
      'Browse BlackPearl\'s handpicked tour deals from top destinations worldwide. Find discounted tours, custom packages, and unforgettable travel experiences.',
    ogType: 'website',
  },
  '/build-package': {
    title: 'Build Your Own Package — BlackPearl',
    description:
      'Create a custom travel package tailored to your budget and tastes. Pick a destination, set your budget, and choose the activities you love.',
    ogType: 'website',
  },
  '/search': {
    title: 'Search — BlackPearl',
    description:
      'Search deals, packages, and bookmarks across BlackPearl. Find the perfect tour or custom trip for your next adventure.',
    ogType: 'website',
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function canonicalUrl(pathname: string): string {
  // Normalize trailing slash on the index route only
  const normalized =
    pathname === '/' ? '/' : pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `${SITE_URL}${normalized}`;
}

/** Write the standard SEO head tags for the current public route. */
export function applyRouteMeta(meta: (typeof PAGE_META)[keyof typeof PAGE_META] | null) {
  const head = document.head;

  // Title
  const titleEl = head.querySelector('title') || document.createElement('title');
  titleEl.textContent = meta ? meta.title : SITE_NAME;
  if (!head.querySelector('title')) head.appendChild(titleEl);

  // Canonical
  const canonical = head.querySelector('link[rel="canonical"]');
  if (canonical) canonical.remove();
  const canonicalLink = document.createElement('link');
  canonicalLink.rel = 'canonical';
  canonicalLink.href = SITE_URL;
  head.appendChild(canonicalLink);

  // Meta description
  const desc = head.querySelector('meta[name="description"]');
  if (desc) desc.remove();
  if (meta?.description) {
    const descEl = document.createElement('meta');
    descEl.name = 'description';
    descEl.content = meta.description;
    head.appendChild(descEl);

    const ogDesc = head.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.remove();
    const ogDescEl = document.createElement('meta') as HTMLMetaElement;
    ogDescEl.setAttribute('property', 'og:description');
    (ogDescEl as HTMLMetaElement).content = meta.description;
    head.appendChild(ogDescEl);

    const twDesc = head.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.remove();
    const twDescEl = document.createElement('meta');
    twDescEl.name = 'twitter:description';
    twDescEl.content = meta.description;
    head.appendChild(twDescEl);
  }

  // OG basics
  const ogTitle = head.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.remove();
  if (meta) {
    const ogTitleEl = document.createElement('meta') as HTMLMetaElement;
    ogTitleEl.setAttribute('property', 'og:title');
    (ogTitleEl as HTMLMetaElement).content = meta.title;
    head.appendChild(ogTitleEl);
  }

  const ogType = head.querySelector('meta[property="og:type"]');
  if (ogType) ogType.remove();
  if (meta?.ogType) {
    const ogTypeEl = document.createElement('meta') as HTMLMetaElement;
    ogTypeEl.setAttribute('property', 'og:type');
    (ogTypeEl as HTMLMetaElement).content = meta.ogType;
    head.appendChild(ogTypeEl);
  }

  const ogUrl = head.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.remove();
  const ogUrlEl = document.createElement('meta') as HTMLMetaElement;
  ogUrlEl.setAttribute('property', 'og:url');
  (ogUrlEl as HTMLMetaElement).content = SITE_URL;
  head.appendChild(ogUrlEl);

  const ogSite = head.querySelector('meta[property="og:site_name"]');
  if (ogSite) ogSite.remove();
  const ogSiteEl = document.createElement('meta') as HTMLMetaElement;
  ogSiteEl.setAttribute('property', 'og:site_name');
  (ogSiteEl as HTMLMetaElement).content = SITE_NAME;
  head.appendChild(ogSiteEl);

  // Twitter card
  const twCard = head.querySelector('meta[name="twitter:card"]');
  if (twCard) twCard.remove();
  const twCardEl = document.createElement('meta');
  twCardEl.name = 'twitter:card';
  twCardEl.content = 'summary_large_image';
  head.appendChild(twCardEl);

  const twTitle = head.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.remove();
  if (meta) {
    const twTitleEl = document.createElement('meta');
    twTitleEl.name = 'twitter:title';
    twTitleEl.content = meta.title;
    head.appendChild(twTitleEl);
  }

  // OG image — keep a default site image in place; deal pages overwrite it
  const ogImage = head.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.remove();
  const ogImageEl = document.createElement('meta') as HTMLMetaElement;
  ogImageEl.setAttribute('property', 'og:image');
  (ogImageEl as HTMLMetaElement).content = `${SITE_URL}/blackpearl.svg`;
  head.appendChild(ogImageEl);

  const twImage = head.querySelector('meta[name="twitter:image"]');
  if (twImage) twImage.remove();
  const twImageEl = document.createElement('meta');
  twImageEl.name = 'twitter:image';
  twImageEl.content = `${SITE_URL}/blackpearl.svg`;
  head.appendChild(twImageEl);

  // Charset + viewport are set in index.html and left alone
}

// ── Route-level head manager ─────────────────────────────────────────

export function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = PAGE_META[pathname] ?? null;

    if (meta) {
      applyRouteMeta(meta);
      return;
    }

    // Deal detail pages: tags are set by DealHead when the deal loads.
    // Until then, clear to a neutral title so we never show a stale deal's tags.
    if (pathname.startsWith('/deals/')) {
      applyRouteMeta(null);
      const titleEl = document.querySelector('title');
      if (titleEl) titleEl.textContent = 'Tour Deal — BlackPearl';
      return;
    }

    // Everything else (404, auth callback, etc.): reset to site defaults.
    applyRouteMeta(null);
  }, [pathname]);

  return null;
}

/** Call from a deal detail page once the deal data is available. */
export function applyDealMeta(deal: {
  title: string;
  destination: string;
  short_description?: string | null;
  description?: string | null;
  image_url?: string | null;
  slug: string;
}) {
  const description =
    deal.short_description ||
    deal.description ||
    `Explore ${deal.destination} with BlackPearl.`;

  applyRouteMeta({
    title: `${deal.title} — ${deal.destination} | BlackPearl`,
    description,
    ogType: 'product',
  });

  const head = document.head;

  const ogImage = head.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.remove();
  if (deal.image_url) {
    const el = document.createElement('meta') as HTMLMetaElement;
    el.setAttribute('property', 'og:image');
    el.content = deal.image_url;
    head.appendChild(el);

    const twImage = head.querySelector('meta[name="twitter:image"]');
    if (twImage) twImage.remove();
    const tw = document.createElement('meta') as HTMLMetaElement;
    tw.setAttribute('name', 'twitter:image');
    tw.content = deal.image_url;
    head.appendChild(tw);
  }

  const titleEl = head.querySelector('title');
  if (titleEl) titleEl.textContent = `${deal.title} — ${deal.destination} | BlackPearl`;

  // Canonical points at the canonical deal URL (lowercase slug + no trailing slash).
  const canonical = head.querySelector('link[rel="canonical"]');
  if (canonical) canonical.remove();
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = `${SITE_URL}/deals/${deal.slug}`;
  head.appendChild(link);
}
