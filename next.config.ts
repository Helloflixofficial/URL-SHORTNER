import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // geoip-lite uses native binaries — only needed locally; on Vercel we use
  // the x-vercel-ip-country header instead.
  serverExternalPackages: ['geoip-lite'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
