import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://veloramedicalinstitute.com/sitemap.xml',
    host: 'https://veloramedicalinstitute.com',
  }
}
