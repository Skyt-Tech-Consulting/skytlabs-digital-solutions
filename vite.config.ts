// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Make server-side settings from .env / .env.local (ADMIN_EMAIL, RESEND_API_KEY, ...) available
// to server code via process.env during `vite dev`. Real environment variables take precedence.
for (const [key, value] of Object.entries(loadEnv("", process.cwd(), ""))) {
  process.env[key] ??= value;
}

export default defineConfig({
  // Production hosting is Vercel: build Vercel serverless output there (Vercel sets VERCEL=1
  // during builds). Elsewhere the Lovable default (Cloudflare) is kept for previews.
  ...(process.env["VERCEL"] ? { nitro: { preset: "vercel" } } : {}),
  ...(process.env["NETLIFY"] ? { nitro: { preset: "netlify" } } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this.
    server: { entry: "server" },
  },
});
