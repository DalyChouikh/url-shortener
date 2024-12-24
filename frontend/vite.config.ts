import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; img-src 'self' data: https://*.googleusercontent.com https://lh3.googleusercontent.com",
    },
  },
});
