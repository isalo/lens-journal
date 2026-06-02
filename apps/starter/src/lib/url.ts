/**
 * Prefix an absolute, site-internal path with Astro's configured `base` so the
 * site works both at the domain root and under a sub-path (e.g. GitHub Pages
 * project sites served from `/<repo>/`).
 *
 * `import.meta.env.BASE_URL` is `'/'` by default, so this is a no-op unless a
 * base is configured at build time.
 */
const BASE_URL = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  if (!path) return path;
  // Leave external, protocol-relative, data and anchor URLs untouched.
  if (
    /^(?:[a-z]+:)?\/\//i.test(path) ||
    /^(?:data:|mailto:|tel:|#)/i.test(path)
  ) {
    return path;
  }
  const base = BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}` || '/';
}
