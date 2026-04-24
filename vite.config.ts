import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    svgr({
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      outDir: 'build',

      devOptions: {
        enabled: false,
      },

      manifest: {
        name: 'KeepWatching! Tracking the TV shows & movies you watch.',
        short_name: 'KeepWatching!',
        description: 'Track TV shows and movies you watch with your family.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#1976d2',
        background_color: '#fafafa',
        lang: 'en',
        categories: ['entertainment', 'lifestyle'],
        icons: [
          { src: 'retrotv192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'retrotv256.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
          { src: 'retrotv512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'retrotv512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: 'screenshots/mobile.png',
            sizes: '586x1264',
            type: 'image/png',
            label: 'KeepWatching home screen',
          },
          {
            src: 'screenshots/desktop.png',
            sizes: '1801x1200',
            type: 'image/png',
            form_factor: 'wide',
            label: 'KeepWatching on desktop',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        globDirectory: 'build',
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        skipWaiting: true,
        clientsClaim: true,

        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https?:\/\/localhost:3033(?!\/api)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-content-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tmdb-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 1209600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3033',
        changeOrigin: true,
      },
    },
    fs: {
      // Allow serving files from linked packages
      allow: ['..'],
    },
    watch: {
      // Watch for changes in linked packages
      followSymlinks: true,
    },
  },
  resolve: {
    // Deduplicate dependencies to avoid conflicts with linked packages
    dedupe: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-is',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      '@ajgifford/keepwatching-types',
    ],
  },
  optimizeDeps: {
    // Force Vite to not pre-bundle the linked package
    exclude: ['@ajgifford/keepwatching-ui'],
    // Include dependencies to ensure proper bundling with React 19 and ESM compatibility
    include: [
      'react-is',
      'prop-types',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'recharts',
      'lodash',
    ],
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 600, // Set to 600 kB to allow current app size while monitoring growth
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (
            ['react/', 'react-dom/', 'react-router-dom/', 'react-is/'].some((p) => id.includes(`/node_modules/${p}`))
          ) {
            return 'react-vendor';
          }
          if (
            ['@mui/material/', '@emotion/react/', '@emotion/styled/'].some((p) => id.includes(`/node_modules/${p}`))
          ) {
            return 'mui-core';
          }
          if (id.includes('/node_modules/@mui/icons-material/')) {
            return 'mui-icons';
          }
          if (['@reduxjs/toolkit/', 'react-redux/'].some((p) => id.includes(`/node_modules/${p}`))) {
            return 'redux';
          }
          if (id.includes('/node_modules/recharts/')) {
            return 'recharts';
          }
          if (id.includes('/node_modules/socket.io-client/')) {
            return 'socket';
          }
          if (id.includes('/node_modules/axios/')) {
            return 'axios';
          }
        },
      },
    },
  },
});
