import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';  // Using import * as syntax for path

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: './',
  server: {
    port: 3000
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
});