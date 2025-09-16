// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      // Polyfills needed for Web3 libraries
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports
        protocolImports: true,
        // Whether to polyfill specific globals
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@config': path.resolve(__dirname, './src/config'),
        '@assets': path.resolve(__dirname, './src/assets'),
        
        // Web3 specific aliases
        process: 'process/browser',
        stream: 'stream-browserify',
        util: 'util',
      },
    },
    
    define: {
      // Define global variables
      global: 'globalThis',
      'process.env': JSON.stringify(env),
      
      // Feature flags for different environments
      __UNICORN_ENV__: JSON.stringify(env.VITE_UNICORN_ENV === 'true'),
      __DEV__: JSON.stringify(mode === 'development'),
      __PROD__: JSON.stringify(mode === 'production'),
    },
    
    optimizeDeps: {
      // Include dependencies that need to be pre-bundled
      include: [
        'react',
        'react-dom',
        'buffer',
        'process',
        '@rainbow-me/rainbowkit',
        '@tanstack/react-query',
        'wagmi',
        'viem',
        'thirdweb',
      ],
      // Force ESM for certain packages
      esbuildOptions: {
        target: 'es2020',
        define: {
          global: 'globalThis',
        },
      },
    },
    
    build: {
      target: 'es2020',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'wagmi-vendor': ['wagmi', 'viem', '@tanstack/react-query'],
            'wallet-vendor': ['@rainbow-me/rainbowkit', 'thirdweb'],
          },
        },
      },
      // Increase chunk size warning limit for Web3 libraries
      chunkSizeWarningLimit: 1000,
    },
    
    server: {
      port: 3000,
      open: true,
      cors: true,
      
      // Headers for iframe compatibility (needed for Unicorn portal)
      headers: {
        // Allow embedding in iframes
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *",
      },
    },
    
    preview: {
      port: 3001,
      open: true,
      cors: true,
      headers: {
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *",
      },
    },
  };
});