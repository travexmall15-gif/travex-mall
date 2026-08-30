import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/shopnekt-ai/**/__tests__/**/*.test.ts'],
  },
})
