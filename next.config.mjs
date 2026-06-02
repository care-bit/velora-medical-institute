/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.veloramedicalinstitute.com' }],
        destination: 'https://veloramedicalinstitute.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
