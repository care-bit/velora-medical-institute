import type { MetadataRoute } from 'next'

const BASE = 'https://veloramedicalinstitute.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/weight-management',
    '/hormone-therapy',
    '/longevity',
    '/programs',
    '/individual-visits',
    '/physicians',
    '/about',
    '/faq',
    '/book',
    '/intake',
    '/contact',
    '/legal/privacy',
    '/legal/hipaa',
    '/legal/terms',
  ]
  const now = new Date()
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === ''
      ? 1
      : path.startsWith('/legal')
      ? 0.3
      : ['/book', '/physicians', '/about'].includes(path)
      ? 0.9
      : 0.8,
  }))
}
