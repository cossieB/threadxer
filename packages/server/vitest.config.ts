import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['src/__tests__/setup'],
    env: {
      DATABASE_URL: "postgresql://postgres:password@localhost:2345/testing"
    },
    onConsoleLog: () => false
  }
}))