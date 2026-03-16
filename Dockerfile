# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1 — Build
#   Uses a Debian-based Node image so we can install a real Chromium from apt.
#   Chromium is required by Puppeteer, which is used at build time for:
#     • Pre-rendering routes (vite-plugin-prerender + @prerenderer/renderer-puppeteer)
#     • Generating the Open Graph image (scripts/generate-og-image.cjs)
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:22-bookworm-slim AS builder

# Install Chromium — apt pulls in all required shared libraries automatically
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip its own Chromium download and use the system one instead
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Install dependencies first (separate layer → better cache invalidation)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --legacy-peer-deps
# Copy the rest of the source code
COPY . .

# ---------------------------------------------------------------------------
# VITE_API_URL is baked into the static JS bundle at build time.
# The React app runs in the visitor's browser, so this must be the
# public-facing URL of the backend (e.g. http://<your-vps-ip>:5001/api).
#
# Override at build time (docker build or docker-compose build):
#   docker build --build-arg VITE_API_URL=http://1.2.3.4:5001/api .
# ---------------------------------------------------------------------------
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL \
    SKIP_PRERENDER=true

# Step 1 — OG image (Puppeteer); non-fatal — a missing og-image.png just means no share preview
RUN node scripts/generate-og-image.cjs || echo "[warn] OG image generation skipped"

# Step 2 — Sitemap (fetches live API); non-fatal — static sitemaps in public/ are used as-is
RUN node scripts/generate-sitemap.cjs || echo "[warn] Sitemap generation skipped"

# Step 3 — Vite bundle + pre-render SEO routes (Puppeteer)
RUN npx vite build

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2 — Serve
#   Lightweight nginx image — only the compiled static assets are copied over.
# ═══════════════════════════════════════════════════════════════════════════════
FROM nginx:stable-alpine AS runner

# Copy built assets from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config (SPA routing, gzip, cache headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
