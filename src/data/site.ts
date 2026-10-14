/**
 * Site-wide identity.
 *
 * Attribution policy: nothing on this site is credited to an individual. Every tool,
 * guide and update is published under the collective team byline below. There are no
 * personal names and no invented authors anywhere in the output.
 *
 * To rename the team, change `team` and `teamFull` here — every byline, the blog
 * archive, the About page and the JSON-LD `author` field all read from this object.
 */
export const SITE = {
  name: "Tools.ly",
  domain: "tools.ly",
  /** Short byline shown on tool pages, blog cards and structured data. */
  team: "Tools.ly Team",
  /** Longer formal name used where there is room for it, such as the About page. */
  teamFull: "Tools.ly Platform Development Team",
  tagline: "Free browser-based tools that never upload your data.",
} as const;

/** Renders an ISO date as "11 January 2026". */
export const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  // Constructed from parts on purpose: `new Date(iso)` would parse as UTC and can
  // render as the previous day in negative-offset time zones.
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/** Machine-readable date-time for <time datetime="...">. */
export const isoDateTime = (iso: string, time = "12:00"): string => `${iso}T${time}:00Z`;

/**
 * Same date, rendered in a given locale. Arabic pages pass "ar-EG-u-ca-gregory" so the
 * digits and month names are Arabic while the calendar stays Gregorian — using a plain
 * "ar-SA" tag would silently switch the calendar to Hijri and change the displayed date.
 */
export const formatDateIn = (iso: string, formatLocale: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(formatLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
