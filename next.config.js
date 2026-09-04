const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
      '/admin/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
      '/dashboard/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
      '/faculty-dashboard/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
      '/hod-dashboard/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Ensure '@/' alias resolves correctly on all platforms (Linux/Render)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;