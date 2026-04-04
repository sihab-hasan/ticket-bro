import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devProxyTarget = env.VITE_DEV_API_PROXY_TARGET || "http://localhost:5000";
  const shouldGenerateSourceMaps = env.VITE_GENERATE_SOURCEMAP === "true";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "../backend/public/app",
      emptyOutDir: true,
      sourcemap: shouldGenerateSourceMaps,
      manifest: true,
      chunkSizeWarningLimit: 900,
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false,
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        process.env.CLOUDFLARE_TUNNEL_HOST || ".trycloudflare.com",
      ],
      proxy: {
        "/api/v1": {
          target: devProxyTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: devProxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: 4173,
      strictPort: false,
    },
  };
});
