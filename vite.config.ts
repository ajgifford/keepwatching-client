import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
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
    // Force CommonJS to ESM conversion
    esbuildOptions: {
      // Mark these as CommonJS modules that need conversion
      mainFields: ['module', 'main'],
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 600, // Set to 600 kB to allow current app size while monitoring growth
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // MUI core components
          'mui-core': ['@mui/material'],
          
          // MUI icons (large package)
          'mui-icons': ['@mui/icons-material'],
          
          // Emotion styling
          'emotion': ['@emotion/react', '@emotion/styled'],
          
          // Redux
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          
          // Charts library
          'recharts': ['recharts'],
          
          // Socket.io
          'socket': ['socket.io-client'],
          
          // Axios
          'axios': ['axios'],
        },
      },
    },
  },
});
