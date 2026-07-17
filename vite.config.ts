import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

function figmaAssetResolver() {
  return {
    name: "figma-asset-resolver",
    resolveId(id: string) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isGithubPages = mode === "github-pages";

  return {
    base: isGithubPages ? "/Azkarapp/" : "/",
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used - do not remove them.
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["**/*.svg"],
        manifest: {
          name: "Azkar",
          short_name: "Azkar",
          description:
            "A daily Islamic remembrance app for reading, counting, and tracking morning, evening, and before-sleep azkar.",
          theme_color: "#0a1228",
          background_color: "#0a1228",
          display: "standalone",
          icons: [
            {
              src: "192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ["**/*.svg", "**/*.csv"],
  };
});
