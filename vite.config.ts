import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    port: 5555,
    proxy: {
      '/api/': {
        target: 'http://localhost:3000'
      }
    }
  }
});
