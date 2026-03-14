import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
// @ts-ignore – vite-plugin-prerender may lack type definitions
import prerender from "vite-plugin-prerender";
// @ts-ignore – @prerenderer/renderer-puppeteer may lack type definitions
import PuppeteerRenderer from "@prerenderer/renderer-puppeteer";

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
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
    prerender({
      staticDir: path.join(__dirname, "dist"),
      routes: PRERENDER_ROUTES,
      renderer: new PuppeteerRenderer({
        // Wait 2.5 s for React + react-helmet-async to render all meta tags
        renderAfterTime: 2500,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      }),
      postProcess(renderedRoute: { html: string; route: string }) {
        // Fix asset paths for nested routes (e.g., /auth/login)
        renderedRoute.html = renderedRoute.html.replace(
          /<script (.*?) src="\/assets\//g,
          '<script $1 src="/assets/',
        );
        return renderedRoute;
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
