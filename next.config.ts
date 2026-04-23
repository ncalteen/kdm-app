import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    // Local Dev
    '127.0.0.1',
    'localhost',
    // Local Network (Multiplayer Testing)
    '192.168.86.21'
  ]
}

export default nextConfig
