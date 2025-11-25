import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: [
      "7b527c1e-7d5e-433a-8740-0f04ec8143d1-00-3cs6hem46d233.spock.replit.dev",
    ],
  },
});
