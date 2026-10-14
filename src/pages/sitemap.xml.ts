import type { APIRoute } from "astro";
import { allTools, urlOf } from "../data/tools";

const staticPages = [
  "/",
  "/all-tools/",
  "/privacy/",
  "/7b3c2-about/",
  "/7b3c2-contact/",
  "/7b3c2-blog-archive/",
];

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string
  );

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("https://tools.ly")).href.replace(/\/$/, "");

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
        lastmod: tool.updated,
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
