import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';  // Using import * as syntax for path

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Attempt to prevent Vite from bundling Node.js core modules in the renderer
      // by aliasing them to a path that won't resolve to a real module.
      // This should make them effectively external for the browser build.
      'fs': '__vite-browser-external:fs',
      'path': '__vite-browser-external:path',
      'os': '__vite-browser-external:os',
    }
  },
  optimizeDeps: {
    exclude: ['fs', 'path', 'os'],
  },
  base: './',
  server: {
    port: 3000
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'public/index.html'),
      external: ['fs', 'path', 'os'], // Also mark them as external for Rollup
    }
  }
});