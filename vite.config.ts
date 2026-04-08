import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// P0-14: Casino migration from Next.js to Vite + S3/CloudFront.
// P0-20: bakes in the SEO/GEO template baseline that later propagates to the SDK
// so every app Casino generates ships with the same structure.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Bundle budget hints — surface warnings when chunks exceed these.
    // Phase E will upgrade these to hard-fail via the seo_optimize pipeline
    // stage on generated apps; Casino itself stays on warnings for now.
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy deps into cacheable vendor chunks.
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          wagmi: ['wagmi', 'viem', '@tanstack/react-query'],
        },
      },
    },
  },
});
