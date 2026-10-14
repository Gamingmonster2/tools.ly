import { defineConfig } from "astro/config";

export default defineConfig({
  // Canonical origin. Every canonical tag, sitemap entry and JSON-LD URL derives from this.
  site: "https://tools.ly",

  // WordPress served every URL with a trailing slash. Keeping that behaviour is what makes
  // the migration SEO-safe: /scientific-calculator/ stays byte-identical.
  trailingSlash: "always",

  build: {
    // Emit dist/<slug>/index.html, matching the old permalink structure.
    format: "directory",
  },

  compressHTML: true,
  devToolbar: { enabled: false },
});
