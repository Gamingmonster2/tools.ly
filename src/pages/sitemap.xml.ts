import type { APIRoute } from "astro";
import { allTools, urlOf } from "../data/tools";
import { arTools, arUrlOf } from "../data/arTools";

/** English pages that are not tools. */
const staticPages = [
  "/",
  "/all-tools/",
  "/privacy/",
  "/7b3c2-about/",
  "/7b3c2-contact/",
  "/7b3c2-blog-archive/",
];

/** Arabic pages that are not tools. The Arabic edition is a separate site, not a mirror. */
const staticPagesAr = ["/ar/", "/ar/كل-الأدوات/", "/ar/عن-الموقع/", "/ar/اتصل-بنا/"];

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string
  );

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("https://tools.ly")).href.replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);

  const entries = [
    ...staticPages.map((path) => ({
      loc: `${base}${path}`,
      priority: path === "/" ? "1.0" : "0.6",
      lastmod: undefined as string | undefined,
    })),
    ...allTools
      .filter((tool) => tool.status === "live")
      .map((tool) => ({
        loc: `${base}${urlOf(tool)}`,
        // Existing, already-indexed URLs get the higher priority.
        priority: tool.updated ? "0.8" : "0.7",
        lastmod: tool.updated ?? tool.published,
      })),

    ...staticPagesAr.map((path) => ({
      loc: `${base}${path}`,
      priority: path === "/ar/" ? "0.9" : "0.6",
      lastmod: path === "/ar/" ? today : undefined,
    })),
    ...arTools
      .filter((tool) => tool.status === "live")
      .map((tool) => ({
        loc: `${base}${arUrlOf(tool)}`,
        priority: "0.8",
        lastmod: tool.updated ?? tool.published,
      })),
  ];

  const body = entries
    .map(
      (entry) =>
        `  <url><loc>${escapeXml(entry.loc)}</loc>` +
        (entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "") +
        `<priority>${entry.priority}</priority></url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
