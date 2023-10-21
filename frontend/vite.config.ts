import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid';
import path from "path"

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api/": "http://127.0.0.1:8080"
    }
  }
})
