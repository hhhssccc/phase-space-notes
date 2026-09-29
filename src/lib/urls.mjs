export function normalizeBase(base = '/') {
  return base === '/' || !base ? '' : `/${String(base).replace(/^\/+|\/+$/g, '')}`;
}
/** Prefix only site-root URLs, once. External, fragment and relative URLs pass through. */
export function siteUrl(path, base = '/') {
  const prefix = normalizeBase(base);
  if (!path.startsWith('/') || path.startsWith('//') || !prefix) return path;
  if (path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}#`)) return path;
  return `${prefix}${path}`;
}
