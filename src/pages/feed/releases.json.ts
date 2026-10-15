import type { APIRoute } from "astro";
import { allTools, urlOf } from "../../data/tools";
import { arTools, arUrlOf } from "../../data/arTools";
import { SITE } from "../../data/site";

/**
 * Release feed for the social publisher.
 *
 * Generated at build time from the same registries the site renders from, so a post can
 * never advertise a tool that does not exist. Consumed by the Cloudflare Worker in
 * `workers/publisher/`, and readable by anything else that wants the release history.
 *
 *   https://tools.ly/feed/releases.json
 */
interface Release {
  id: string;
  locale: "en" | "ar";
  title: string;
  description: string;
  url: string;
  published: string;
  publishedTime: string;
  category: string;
  image?: string;
}

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("https://tools.ly")).href.replace(/\/$/, "");

  const releases: Release[] = [
    ...arTools
      .filter((tool) => tool.status === "live")
      .map((tool) => ({
        id: `ar:${tool.slug}`,
        locale: "ar" as const,
        title: tool.nav ?? tool.title,
        description: tool.description,
        url: `${base}${arUrlOf(tool)}`,
        published: tool.published,
        publishedTime: tool.publishedTime,
        category: tool.category,
      })),
    ...allTools
      .filter((tool) => tool.status === "live")
      .map((tool) => ({
        id: `en:${tool.slug}`,
        locale: "en" as const,
        title: tool.nav ?? tool.title,
        description: tool.description,
        url: `${base}${urlOf(tool)}`,
        published: tool.published,
        publishedTime: tool.publishedTime,
        category: tool.category,
      })),
  ].sort((a, b) =>
    a.published.localeCompare(b.published) || a.publishedTime.localeCompare(b.publishedTime)
  );

  const payload = {
    site: SITE.name,
    generatedAt: new Date().toISOString(),
    count: releases.length,
    releases,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
