import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// All public-facing routes to be pre-rendered for SEO (crawlers receive full HTML)
const PRERENDER_ROUTES = [
  "/",
  "/about",
  "/courses",
  "/certificates/verify",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/browse/product-courses",
];

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const plugins: any[] = [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ];

  // Only add the prerender plugin during build (not dev) and when not in Docker/CI.
  // vite-plugin-prerender uses require() internally which conflicts with ESM in Node 22.
  // Set SKIP_PRERENDER=true to skip (done automatically in the Dockerfile).
  if (command === "build" && !process.env.SKIP_PRERENDER) {
    // @ts-ignore – vite-plugin-prerender may lack type definitions
    const { default: prerender } = await import("vite-plugin-prerender");
    // @ts-ignore – @prerenderer/renderer-puppeteer may lack type definitions
    const { default: PuppeteerRenderer } =
      await import("@prerenderer/renderer-puppeteer");

    plugins.push(
      prerender({
        staticDir: path.join(__dirname, "dist"),
        routes: PRERENDER_ROUTES,
        renderer: new PuppeteerRenderer({
          renderAfterTime: 2500,
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }),
        postProcess(renderedRoute: { html: string; route: string }) {
          renderedRoute.html = renderedRoute.html.replace(
            /<script (.*?) src="\/assets\//g,
            '<script $1 src="/assets/',
          );
          return renderedRoute;
        },
      }),
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
