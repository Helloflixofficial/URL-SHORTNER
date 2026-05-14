import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['geoip-lite', 'bcryptjs'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
