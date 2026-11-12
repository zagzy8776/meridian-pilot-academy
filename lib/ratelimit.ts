const buckets = new Map<string, number[]>();

export function limited(key: string, max = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
  return hits.length > max;
}

export function ipOf(req: Request) {
  const h = req.headers;
  return (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}
