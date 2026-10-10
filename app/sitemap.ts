export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const now = new Date();
  const routes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/programs', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/program-details', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/team', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/apply', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/refund-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
  ] as const;
  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

