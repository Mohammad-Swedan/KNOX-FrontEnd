/**
 * eCampus | منصة ايكامبس — Dynamic Sitemap Generator
 * =====================================================
 * Fetches live data from the production API and generates:
 *   public/sitemap-universities.xml   — university / faculty / major pages
 *   public/sitemap-courses.xml        — academic course detail pages
 *   public/sitemap-product-courses.xml — product/paid course catalog pages
 *
 * Run: node scripts/generate-sitemap.cjs
 * Or automatically via: npm run build  (hooked as pre-step)
 *
 * Requirements: Node 18+ (uses built-in fetch). No extra deps needed.
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ─── Configuration ───────────────────────────────────────────────────────────
const BASE_URL = "https://ecampusjo.com";
const API_BASE = process.env.VITE_API_URL || "https://knox.premiumasp.net/api";
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const TODAY = new Date().toISOString().split("T")[0];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hreflang(loc) {
  return `    <xhtml:link rel="alternate" hreflang="ar" href="${loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>`;
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod || TODAY}</lastmod>
    <changefreq>${changefreq || "weekly"}</changefreq>
    <priority>${priority || "0.7"}</priority>
${hreflang(loc)}
  </url>`;
}

function sitemapWrapper(urls, comment = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  eCampus | منصة ايكامبس — ${comment}
  Domain: ${BASE_URL}
  Generated: ${TODAY}
-->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls.join("\n")}
</urlset>`;
}

async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Universities Sitemap ─────────────────────────────────────────────────────
async function generateUniversitiesSitemap() {
  console.log("  → Fetching universities…");
  const data = await safeFetch(
    `${API_BASE}/Universities?pageNumber=1&pageSize=200`,
  );
  const universities = data?.items || data?.data || data || [];

  const entries = [];

  for (const uni of universities) {
    const uniId = uni.id || uni.universityId;
    if (!uniId) continue;

    // Faculties endpoint
    const facData = await safeFetch(
      `${API_BASE}/Universities/${uniId}/faculties?pageNumber=1&pageSize=100`,
    );
    const faculties = facData?.items || facData?.data || facData || [];

    for (const fac of faculties) {
      const facId = fac.id || fac.facultyId;
      if (!facId) continue;

      // Majors endpoint
      const majData = await safeFetch(
        `${API_BASE}/Universities/${uniId}/faculties/${facId}/majors?pageNumber=1&pageSize=100`,
      );
      const majors = majData?.items || majData?.data || majData || [];

      for (const maj of majors) {
        const majId = maj.id || maj.majorId;
        if (!majId) continue;

        entries.push(
          urlEntry({
            loc: `${BASE_URL}/dashboard/universities/${uniId}/faculties/${facId}/majors/${majId}`,
            changefreq: "weekly",
            priority: "0.75",
          }),
        );
      }
    }
  }

  const content = sitemapWrapper(
    entries.length
      ? entries
      : [
          urlEntry({
            loc: `${BASE_URL}/courses`,
            changefreq: "daily",
            priority: "0.9",
          }),
        ],
    "Universities / Faculties / Majors Sitemap",
  );

  fs.writeFileSync(
    path.join(PUBLIC_DIR, "sitemap-universities.xml"),
    content,
    "utf8",
  );
  console.log(`  ✓ sitemap-universities.xml  (${entries.length} entries)`);
}

// ─── Courses Sitemap ──────────────────────────────────────────────────────────
async function generateCoursesSitemap() {
  console.log("  → Fetching courses…");
  // Try fetching all courses (paginated)
  let allCourses = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const data = await safeFetch(
      `${API_BASE}/Courses?pageNumber=${page}&pageSize=${pageSize}`,
    );
    if (!data) break;
    const items = data.items || data.data || (Array.isArray(data) ? data : []);
    if (!items.length) break;
    allCourses = allCourses.concat(items);
    if (items.length < pageSize) break;
    page++;
    if (page > 20) break; // safety cap
  }

  const entries = allCourses.map((course) => {
    const id = course.id || course.courseId;
    return urlEntry({
      loc: `${BASE_URL}/courses/${id}/info`,
      lastmod: course.updatedAt
        ? new Date(course.updatedAt).toISOString().split("T")[0]
        : TODAY,
      changefreq: "weekly",
      priority: "0.8",
    });
  });

  const content = sitemapWrapper(
    entries.length
      ? entries
      : [
          urlEntry({
            loc: `${BASE_URL}/courses`,
            changefreq: "daily",
            priority: "0.9",
          }),
        ],
    "Academic Courses Sitemap | مقررات دراسية",
  );

  fs.writeFileSync(
    path.join(PUBLIC_DIR, "sitemap-courses.xml"),
    content,
    "utf8",
  );
  console.log(`  ✓ sitemap-courses.xml  (${entries.length} entries)`);
}

// ─── Product Courses Sitemap ──────────────────────────────────────────────────
async function generateProductCoursesSitemap() {
  console.log("  → Fetching product courses…");
  let allCourses = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const data = await safeFetch(
      `${API_BASE}/ProductCourses?pageNumber=${page}&pageSize=${pageSize}`,
    );
    if (!data) break;
    const items = data.items || data.data || (Array.isArray(data) ? data : []);
    if (!items.length) break;
    allCourses = allCourses.concat(items);
    if (items.length < pageSize) break;
    page++;
    if (page > 20) break;
  }

  const entries = allCourses.map((course) => {
    const id = course.id || course.productCourseId;
    const slug =
      course.slug || course.title?.toLowerCase().replace(/\s+/g, "-") || id;
    return urlEntry({
      loc: `${BASE_URL}/browse/product-courses/${id}/${slug}`,
      lastmod: course.updatedAt
        ? new Date(course.updatedAt).toISOString().split("T")[0]
        : TODAY,
      changefreq: "weekly",
      priority: "0.85",
    });
  });

  const content = sitemapWrapper(
    entries.length
      ? entries
      : [
          urlEntry({
            loc: `${BASE_URL}/browse/product-courses`,
            changefreq: "daily",
            priority: "0.85",
          }),
        ],
    "Product Courses Sitemap | كورسات مدفوعة",
  );

  fs.writeFileSync(
    path.join(PUBLIC_DIR, "sitemap-product-courses.xml"),
    content,
    "utf8",
  );
  console.log(`  ✓ sitemap-product-courses.xml  (${entries.length} entries)`);
}

// ─── Sitemap Index ────────────────────────────────────────────────────────────
function generateSitemapIndex() {
  const sitemaps = [
    "sitemap-static.xml",
    "sitemap-universities.xml",
    "sitemap-courses.xml",
    "sitemap-product-courses.xml",
  ];

  const entries = sitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${BASE_URL}/${s}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`,
    )
    .join("\n");

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  eCampus | منصة ايكامبس — Sitemap Index
  Domain: ${BASE_URL}
  Generated: ${TODAY}
-->
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), content, "utf8");
  console.log("  ✓ sitemap.xml (index)");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("\n🗺️  eCampus Sitemap Generator | منصة ايكامبس\n");

  // Ensure fetch is available (Node 18+)
  if (typeof fetch === "undefined") {
    console.warn(
      "⚠️  fetch not available. Requires Node 18+. Generating placeholder sitemaps.",
    );
    // Write empty sitemaps so the build doesn't fail
    const placeholder = sitemapWrapper([], "Placeholder - API not reachable");
    fs.writeFileSync(
      path.join(PUBLIC_DIR, "sitemap-universities.xml"),
      placeholder,
      "utf8",
    );
    fs.writeFileSync(
      path.join(PUBLIC_DIR, "sitemap-courses.xml"),
      placeholder,
      "utf8",
    );
    fs.writeFileSync(
      path.join(PUBLIC_DIR, "sitemap-product-courses.xml"),
      placeholder,
      "utf8",
    );
    generateSitemapIndex();
    return;
  }

  try {
    await Promise.allSettled([
      generateUniversitiesSitemap(),
      generateCoursesSitemap(),
      generateProductCoursesSitemap(),
    ]);
    generateSitemapIndex();
    console.log("\n✅  All sitemaps generated successfully!\n");
  } catch (err) {
    console.error("❌  Sitemap generation failed:", err.message);
    // Don't block the build
    process.exit(0);
  }
})();
