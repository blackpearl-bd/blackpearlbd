// R2 helpers shared by upload and admin routes.
//
// Uploaded deal images live under the "deals/" prefix and are served through
// the Worker at /upload/image/<key>. These helpers extract the R2 key back out
// of a stored image URL so admin actions can delete the object with the row.

const R2_IMAGE_PREFIX = 'deals/';

/** Extract the R2 object key from a Worker-served image URL, or null. */
export function r2KeyFromImageUrl(url: unknown): string | null {
  if (typeof url !== 'string' || url.length === 0) return null;
  const match = url.match(/\/upload\/image\/(.+)$/);
  if (!match) return null;
  let key: string;
  try {
    key = decodeURIComponent(match[1]);
  } catch {
    return null;
  }
  // Drop any querystring and keep only keys under the deals/ prefix —
  // deal images are never stored elsewhere.
  key = key.split('?')[0];
  return key.startsWith(R2_IMAGE_PREFIX) ? key : null;
}

/** Collect the unique R2 keys referenced by a deal's image_url + gallery. */
export function collectR2ImageKeys(imageUrl: unknown, gallery: unknown): string[] {
  const keys: string[] = [];
  const main = r2KeyFromImageUrl(imageUrl);
  if (main) keys.push(main);
  if (Array.isArray(gallery)) {
    for (const item of gallery) {
      const key = r2KeyFromImageUrl(item);
      if (key && !keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}
