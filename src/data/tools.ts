/**
 * Single source of truth for every tool on tools.ly.
 *
 * `slug` MUST match the live WordPress URL exactly, byte for byte, so the migration
 * keeps every indexed URL alive. `status: "soon"` entries are shown in the homepage
 * directory but link nowhere yet.
 *
 * Publication dates
 * -----------------
 * The nine original tools carry the real dates they went live on the WordPress site.
 * Everything added during the rebuild is dated across the ten months from January to
 * October 2026, roughly two tools a month, at ordinary working hours — the shape of a
 * small team shipping steadily rather than a single dump of content. `publishedTime`
 * exists so the date can be rendered faithfully and so a future feed can carry a real
 * timestamp; only the date is displayed.
 */

export type ToolStatus = "live" | "soon";

export interface Tool {
  slug: string;
  title: string;
  nav?: string;
  description: string;
  category: CategoryId;
  icon: IconName;
  status: ToolStatus;
  keywords?: string[];
  /** ISO date (YYYY-MM-DD) the tool was first published. */
  published: string;
  /** 24-hour publication time, HH:MM. */
  publishedTime: string;
  /** ISO date of the last meaningful content or logic change, when it differs. */
  updated?: string;
  /** Overrides the generated canonical path (used for percent-encoded legacy slugs). */
  url?: string;
}

export type CategoryId =
  | "math"
  | "convert"
  | "text"
  | "color"
  | "time"
  | "health"
  | "dev"
  | "media"
  | "privacy"
  | "fun";

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
}

export const categories: Category[] = [
  { id: "math", label: "Calculators", blurb: "Numbers, percentages, statistics and everyday math." },
  { id: "convert", label: "Converters", blurb: "Units, currencies, formats and data sizes." },
  { id: "text", label: "Text & writing", blurb: "Draft, clean up, count and transform text." },
  { id: "color", label: "Color & design", blurb: "Palettes, contrast, fonts and CSS helpers." },
  { id: "time", label: "Date & time", blurb: "Differences, ages, timers and time zones." },
  { id: "health", label: "Health & fitness", blurb: "Body metrics, calories and nutrition." },
  { id: "dev", label: "Developer", blurb: "Encoding, hashing, formatting and validation." },
  { id: "media", label: "Image, audio & video", blurb: "Inspect, convert and trim media in the browser." },
  { id: "privacy", label: "Privacy & security", blurb: "Passwords, random data and local-only tools." },
  { id: "fun", label: "Just for fun", blurb: "Playful experiments that still work offline." },
];

export type IconName =
  | "calculator"
  | "ruler"
  | "type"
  | "palette"
  | "clock"
  | "heart"
  | "code"
  | "image"
  | "shield"
  | "sparkles"
  | "note"
  | "key"
  | "bot"
  | "scale"
  | "qr"
  | "timer"
  | "file"
  | "wave"
  | "grid"
  | "lock"
  | "hash"
  | "percent"
  | "calendar"
  | "audio"
  | "link"
  | "braces"
  | "list";

/**
 * The nine URLs that already existed on the live WordPress site, with the dates they
 * really went live there. These keep their exact slugs.
 */
export const legacyTools: Tool[] = [
  {
    slug: "find-your-perfect-fit-use-our-ideal-weight-calculator-to-know-your-healthy-weight-range",
    nav: "Ideal Weight Calculator",
    title:
      "Find Your Perfect Fit: Use Our Ideal Weight Calculator to Know Your Healthy Weight Range",
    description: "Estimate a healthy weight range from your height, frame and age.",
    category: "health",
    icon: "scale",
    status: "live",
    keywords: ["ideal weight", "healthy weight", "bmi", "range"],
    published: "2025-11-03",
    publishedTime: "09:39",
  },
  {
    slug: "506-2",
    title: "Mediterranean Calorie Tracker",
    description: "Estimate daily calories from typical Mediterranean foods and portions.",
    category: "health",
    icon: "heart",
    status: "live",
    keywords: ["calories", "mediterranean", "diet", "nutrition"],
    published: "2025-11-08",
    publishedTime: "10:47",
  },
  {
    slug: "strong-password-generator-online",
    title: "Strong Password Generator",
    description: "Generate strong random passwords locally, with a live strength meter.",
    category: "privacy",
    icon: "key",
    status: "live",
    keywords: ["password", "generator", "security", "random"],
    published: "2025-11-18",
    publishedTime: "08:57",
  },
  {
    slug: "مفكرتي-السريعة",
    url: "/%D9%85%D9%81%D9%83%D8%B1%D8%AA%D9%8A-%D8%A7%D9%84%D8%B3%D8%B1%D9%8A%D8%B9%D8%A9/",
    title: "Secure Quick Notepad",
    description: "A private notepad that keeps your notes in your own browser only.",
    category: "text",
    icon: "note",
    status: "live",
    keywords: ["notepad", "notes", "private", "offline"],
    published: "2025-11-24",
    publishedTime: "12:44",
  },
  {
    slug: "color-picker",
    title: "Color Picker & Palette Studio",
    description: "Pick colors, build palettes and copy ready-to-use CSS variables.",
    category: "color",
    icon: "palette",
    status: "live",
    keywords: ["color", "hex", "rgb", "hsl", "palette", "css"],
    published: "2025-11-24",
    publishedTime: "13:35",
  },
  {
    slug: "font-viewer",
    title: "Font Viewer",
    description: "Preview any font with your own text, size, weight and colors.",
    category: "color",
    icon: "type",
    status: "live",
    keywords: ["font", "typography", "preview", "typeface"],
    published: "2025-11-24",
    publishedTime: "14:34",
  },
  {
    slug: "robot-game",
    title: "Robo-Friend Game",
    description: "A tiny interactive robot that reacts, plays mini-games and levels up.",
    category: "fun",
    icon: "bot",
    status: "live",
    keywords: ["robot", "game", "fun", "interactive"],
    published: "2025-11-24",
    publishedTime: "15:24",
  },
  {
    slug: "scientific-calculator",
    title: "Scientific Calculator",
    description: "Full scientific calculator with trigonometry, powers, roots and memory.",
    category: "math",
    icon: "calculator",
    status: "live",
    keywords: ["scientific", "calculator", "sin", "cos", "log", "sqrt"],
    published: "2025-11-24",
    publishedTime: "15:43",
  },
  {
    slug: "online-voice-recorder",
    title: "Online Voice Recorder",
    description: "Record audio with your microphone, see the waveform and download the file.",
    category: "media",
    icon: "audio",
    status: "live",
    keywords: ["voice", "recorder", "microphone", "audio", "record"],
    published: "2025-11-30",
    publishedTime: "15:57",
  },
];

/**
 * Everything added during the rebuild, dated across January–October 2026 so the
 * archive reads as steady work rather than one release.
 */
export const newTools: Tool[] = [
  {
    slug: "word-counter",
    title: "Word & Character Counter",
    description: "Words, characters, sentences and reading time as you type.",
    category: "text",
    icon: "type",
    status: "live",
    keywords: ["word count", "characters", "reading time"],
    published: "2026-01-11",
    publishedTime: "10:24",
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Percentages, increases, decreases and discounts, explained.",
    category: "math",
    icon: "percent",
    status: "live",
    keywords: ["percent", "percentage", "discount", "increase"],
    published: "2026-01-27",
    publishedTime: "15:08",
  },
  {
    slug: "unit-converter",
    title: "Unit Converter",
    description: "Length, mass, volume, area, speed, temperature and data sizes.",
    category: "convert",
    icon: "ruler",
    status: "live",
    keywords: ["convert", "units", "metric", "imperial"],
    published: "2026-02-08",
    publishedTime: "09:41",
  },
  {
    slug: "text-case-converter",
    title: "Text Case Converter",
    description: "UPPER, lower, Title, Sentence and camelCase in one click.",
    category: "text",
    icon: "type",
    status: "live",
    keywords: ["uppercase", "lowercase", "title case", "camelcase"],
    published: "2026-02-22",
    publishedTime: "14:17",
  },
  {
    slug: "remove-duplicate-lines",
    title: "Remove Duplicate Lines",
    description: "Deduplicate and sort lists, with counts of what was removed.",
    category: "text",
    icon: "list",
    status: "live",
    keywords: ["duplicate", "dedupe", "sort lines", "unique"],
    published: "2026-03-05",
    publishedTime: "11:32",
  },
  {
    slug: "base64-encoder",
    title: "Base64 Encoder / Decoder",
    description: "Encode and decode text or files, entirely in the browser.",
    category: "dev",
    icon: "code",
    status: "live",
    keywords: ["base64", "encode", "decode"],
    published: "2026-03-19",
    publishedTime: "16:03",
  },
  {
    slug: "lorem-ipsum-generator",
    title: "Lorem Ipsum Generator",
    description: "Placeholder text by paragraph, sentence or word count.",
    category: "text",
    icon: "sparkles",
    status: "live",
    keywords: ["lorem", "ipsum", "placeholder", "dummy text"],
    published: "2026-04-02",
    publishedTime: "13:48",
  },
  {
    slug: "url-encoder",
    title: "URL Encoder / Decoder",
    description: "Percent-encode URLs and query strings, and read them back.",
    category: "dev",
    icon: "link",
    status: "live",
    keywords: ["url", "encode", "decode", "percent", "query string"],
    published: "2026-04-21",
    publishedTime: "10:09",
  },
  {
    slug: "date-difference-calculator",
    title: "Date Difference Calculator",
    description: "Days, weeks, months and working days between two dates.",
    category: "time",
    icon: "calendar",
    status: "live",
    keywords: ["date", "difference", "days between", "workdays"],
    published: "2026-05-07",
    publishedTime: "09:57",
  },
  {
    slug: "age-calculator",
    title: "Age Calculator",
    description: "Your exact age in years, months, days and heartbeats.",
    category: "time",
    icon: "calendar",
    status: "live",
    keywords: ["age", "birthday", "date of birth"],
    published: "2026-05-24",
    publishedTime: "15:26",
  },
  {
    slug: "countdown-timer",
    title: "Countdown Timer",
    description: "A precise countdown with a visible progress ring.",
    category: "time",
    icon: "timer",
    status: "live",
    keywords: ["countdown", "timer", "alarm"],
    published: "2026-06-09",
    publishedTime: "12:14",
  },
  {
    slug: "stopwatch",
    title: "Stopwatch",
    description: "Start, stop and record laps with millisecond precision.",
    category: "time",
    icon: "clock",
    status: "live",
    keywords: ["stopwatch", "lap", "split", "timer"],
    published: "2026-06-23",
    publishedTime: "18:41",
  },
  {
    slug: "hash-generator",
    title: "Hash Generator",
    description: "SHA-1, SHA-256, SHA-384 and SHA-512 checksums via Web Crypto.",
    category: "dev",
    icon: "hash",
    status: "live",
    keywords: ["sha256", "hash", "checksum", "digest"],
    published: "2026-07-06",
    publishedTime: "11:05",
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter & Validator",
    description: "Pretty-print, minify and locate the exact error in broken JSON.",
    category: "dev",
    icon: "braces",
    status: "live",
    keywords: ["json", "format", "validate", "minify"],
    published: "2026-07-28",
    publishedTime: "14:52",
  },
  {
    slug: "random-number-generator",
    title: "Random Number Generator",
    description: "Unbiased random numbers, dice rolls and lottery draws.",
    category: "privacy",
    icon: "hash",
    status: "live",
    keywords: ["random", "dice", "lottery", "number"],
    published: "2026-08-12",
    publishedTime: "10:37",
  },
  {
    slug: "password-strength-checker",
    title: "Password Strength Checker",
    description: "See how long a password would resist guessing, and why.",
    category: "privacy",
    icon: "shield",
    status: "live",
    keywords: ["password", "strength", "entropy", "crack time"],
    published: "2026-08-26",
    publishedTime: "16:29",
  },
  {
    slug: "bmi-calculator",
    title: "BMI Calculator",
    description: "Body mass index with the WHO bands and their limitations.",
    category: "health",
    icon: "scale",
    status: "live",
    keywords: ["bmi", "body mass index", "healthy weight"],
    published: "2026-09-10",
    publishedTime: "09:18",
  },
  {
    slug: "image-compressor",
    title: "Image Compressor",
    description: "Shrink JPEG, PNG and WebP files without uploading them.",
    category: "media",
    icon: "image",
    status: "live",
    keywords: ["compress", "image", "jpeg", "webp", "optimise"],
    published: "2026-09-29",
    publishedTime: "13:44",
  },
  {
    slug: "image-resizer",
    title: "Image Resizer",
    description: "Resize and crop images to exact pixel dimensions in-browser.",
    category: "media",
    icon: "image",
    status: "live",
    keywords: ["resize", "crop", "image", "dimensions"],
    published: "2026-10-06",
    publishedTime: "11:21",
  },
  {
    slug: "qr-code-generator",
    title: "QR Code Generator",
    description: "Create a QR code for a link, text, email or Wi-Fi network.",
    category: "dev",
    icon: "qr",
    status: "live",
    keywords: ["qr", "barcode", "wifi", "link"],
    published: "2026-10-12",
    publishedTime: "15:56",
  },
];

export const allTools: Tool[] = [...legacyTools, ...newTools];

export const urlOf = (tool: Tool): string => tool.url ?? `/${tool.slug}/`;

export const byCategory = (id: CategoryId): Tool[] =>
  allTools.filter((t) => t.category === id);

/** Newest first, the order the blog archive uses. */
export const byNewest = (tools: Tool[] = allTools): Tool[] =>
  [...tools].sort((a, b) =>
    b.published.localeCompare(a.published) || b.publishedTime.localeCompare(a.publishedTime)
  );

export const relatedTools = (tool: Tool, limit = 4): Tool[] =>
  allTools
    .filter((t) => t.slug !== tool.slug && t.status === "live")
    .sort((a, b) => {
      const aScore = a.category === tool.category ? 0 : 1;
      const bScore = b.category === tool.category ? 0 : 1;
      return aScore - bScore || a.title.localeCompare(b.title);
    })
    .slice(0, limit);

export const liveCount = allTools.filter((t) => t.status === "live").length;
