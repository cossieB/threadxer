import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({mode}) => ({
  plugins: [tsconfigPaths()],
  test: {
    env: {
      DATABASE_URL: "postgresql://postgres:password@localhost:2345/testing"
    },
    onConsoleLog: () => true
  }
}))