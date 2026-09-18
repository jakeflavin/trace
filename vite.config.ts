import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Served from a sub-path of the portfolio's Hosting site.
  base: '/trace/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    /*
     * The first render draws a dozen SVG pages (the preview and eleven thumbnails) in a
     * cold jsdom, which is several seconds on a two-core runner. High enough to absorb
     * that, low enough to still catch a test that has genuinely hung.
     */
    testTimeout: 20000,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
