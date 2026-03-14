/**
 * eCampus OG Image Generator
 * ──────────────────────────
 * Uses Puppeteer (already installed for prerendering) to render
 * scripts/og-image-template.html at 1200×630px and save it as
 * public/og-image.png — the Open Graph / Twitter Card share image.
 *
 * Run:  node scripts/generate-og-image.cjs
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATE = path.join(ROOT, "scripts", "og-image-template.html");
const OUTPUT = path.join(ROOT, "public", "og-image.png");

(async () => {
  console.log("🖼️  eCampus OG Image Generator | منصة ايكامبس\n");

  if (!fs.existsSync(TEMPLATE)) {
    console.error("  ✗ Template not found:", TEMPLATE);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();

    // Set exact OG image dimensions
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

    // Load the template HTML (file:// URL)
    const fileUrl = "file:///" + TEMPLATE.replace(/\\/g, "/");
    await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 15000 });

    // Wait for fonts/animations to settle
    await new Promise((r) => setTimeout(r, 500));

    // Screenshot the full page
    await page.screenshot({
      path: OUTPUT,
      type: "png",
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });

    const size = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
    console.log(`  ✓ og-image.png generated  (${size} KB)`);
    console.log(`  → ${OUTPUT}\n`);
    console.log("✅  Done!\n");
  } catch (err) {
    console.error("  ✗ Error generating OG image:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
