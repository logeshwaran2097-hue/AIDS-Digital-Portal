const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
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
            value: 'SAMEORIGIN',
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
            value: 'camera=(self), geolocation=(self), microphone=(), payment=(), usb=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "upgrade-insecure-requests; default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data: blob:; font-src 'self' https: data: fonts.gstatic.com; connect-src 'self' https: wss: data: blob:; frame-ancestors 'self';",
          },
        ],
      },
      {
        source: '/:path*.apk',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.android.package-archive',
          },
          {
            key: 'Content-Disposition',
            value: 'attachment; filename="Digital-Portal-of-AI-and-DS.apk"',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
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