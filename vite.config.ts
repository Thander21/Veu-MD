import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: '127.0.0.1'
  },
  // To access env vars that start with TAURI_
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // Tauri supports es2021
    target: ['es2021', 'chrome105', 'safari13'],
    // don't minify for debug builds
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG
  }
});

