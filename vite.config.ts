import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  return {
    // Sets the base path relative to your repository name when building for production
    base: command === 'build' ? '/Mj-/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in IDX Studio via DISABLE_HMR env var.
      // Do not modify; config matching is disabled to prevent flickering
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during builds
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/blogger-feed': {
          target: 'https://blogspot.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/blogger-feed/, '/feeds/posts/default?alt=json'),
        },
      },
    },
  };
});
