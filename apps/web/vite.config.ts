import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env['VITE_API_URL'] ?? 'http://localhost:4000'

  return {
    plugins: [
      react(),

      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: false },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
        manifest: {
          name: 'Khetly — Farm Rental Marketplace',
          short_name: 'Khetly',
          description: 'Rent farmland directly from farmers near you',
          theme_color: '#3B6D11',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: new RegExp(`^${apiUrl}/v1/listings`),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'listings-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
              },
            },
            {
              urlPattern: /^https:\/\/tile\.openstreetmap\.org\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'map-tiles',
                expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@store': resolve(__dirname, 'src/store'),
        '@services': resolve(__dirname, 'src/services'),
        '@lib': resolve(__dirname, 'src/lib'),
        '@modules': resolve(__dirname, 'src/modules'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@assets': resolve(__dirname, 'src/assets'),
      },
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env['npm_package_version'] ?? '0.1.0'),
    },

    server: {
      port: 3000,
      host: true,
      proxy: {
        '/v1': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },

    build: {
      target: 'ES2022',
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query', 'axios'],
            'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
            'vendor-radix': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-tabs',
              '@radix-ui/react-avatar',
              '@radix-ui/react-progress',
              '@radix-ui/react-tooltip',
            ],
            'vendor-maps': ['leaflet', 'react-leaflet'],
            'vendor-state': ['zustand', 'immer'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'zustand',
        'immer',
        'axios',
        'clsx',
        'tailwind-merge',
        'lucide-react',
        'date-fns',
        'zod',
      ],
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/lib/test-setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'src/lib/test-setup.ts', '**/*.d.ts'],
      },
    },
  }
})
