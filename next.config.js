/** @type {import('next').NextConfig} */

// Bundle analyzer (optional)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Build optimizations
  //swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // TypeScript and ESLint settings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      'recharts',
      'date-fns'
    ],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  
  // Headers for performance and security
  async headers() {
    return [
      // API headers
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
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
        ],
      },
      // Static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // General security headers
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'next-auth.session-token',
          },
        ],
      },
    ]
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer, webpack }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separate chunk for large libraries
          recharts: {
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 20,
          },
          // React and related
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          // Next.js related
          next: {
            test: /[\\/]node_modules[\\/](next)[\\/]/,
            name: 'next',
            chunks: 'all',
            priority: 20,
          },
        },
      }
      
      // Add webpack plugins for production
      config.plugins.push(
        new webpack.optimize.ModuleConcatenationPlugin()
      )
    }
    
    // Development optimizations
    if (dev) {
      // Faster builds in development
      config.optimization.removeAvailableModules = false
      config.optimization.removeEmptyChunks = false
      config.optimization.splitChunks = false
    }
    
    // Module resolution optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize imports
      '@radix-ui/react-slot': require.resolve('@radix-ui/react-slot'),
    }
    
    return config
  },
  
  // Environment variables available in browser
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  
  // Output optimization for deployment
  output: 'standalone',
  
  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  
  // Development only features
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      position: 'bottom-right',
    },
  }),
}

module.exports = withBundleAnalyzer(nextConfig)