import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, '.') },
  },
  test: {
    environment: 'node',
    include: [
      'lib/shopnekt-ai/**/__tests__/**/*.test.ts',
      'lib/security/**/__tests__/**/*.test.ts',
      'app/api/**/__tests__/**/*.test.ts',
    ],
  },
})
