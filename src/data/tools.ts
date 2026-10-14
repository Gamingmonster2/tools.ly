/**
 * Single source of truth for every tool on tools.ly.
 *
 * `slug` MUST match the live WordPress URL exactly, byte for byte, so the
 * migration keeps every indexed URL alive. `status: "soon"` entries are shown
 * in the homepage directory but link nowhere yet.
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
 * The eight URLs that already exist on the live WordPress site.
 * These are re-implemented first and keep their exact slugs.
 */
export const legacyTools: Tool[] = [
  {
    slug: "scientific-calculator",
    title: "Scientific Calculator",
    description: "Full scientific calculator with trigonometry, powers, roots and memory.",
    category: "math",
    icon: "calculator",
    status: "live",
    keywords: ["scientific", "calculator", "sin", "cos", "log", "sqrt"],
    updated: "2025-11-24",
  },
  {
    slug: "color-picker",
    title: "Color Picker & Palette Studio",
    description: "Pick colors, build palettes and copy ready-to-use CSS variables.",
    category: "color",
    icon: "palette",
    status: "live",
    keywords: ["color", "hex", "rgb", "hsl", "palette", "css"],
    updated: "2025-11-24",
  },
  {
    slug: "font-viewer",
    title: "Font Viewer",
    description: "Preview any font with your own text, size, weight and colors.",
    category: "color",
    icon: "type",
    status: "live",
    keywords: ["font", "typography", "preview", "typeface"],
    updated: "2025-11-24",
  },
  {
    slug: "strong-password-generator-online",
    title: "Strong Password Generator",
    description: "Generate strong random passwords locally, with a live strength meter.",
    category: "privacy",
    icon: "key",
    status: "live",
    keywords: ["password", "generator", "security", "random"],
    updated: "2025-11-18",
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
    updated: "2025-11-24",
  },
  {
    slug: "506-2",
    title: "Mediterranean Calorie Tracker",
    description: "Estimate daily calories from typical Mediterranean foods and portions.",
    category: "health",
    icon: "heart",
    status: "live",
    keywords: ["calories", "mediterranean", "diet", "nutrition"],
    updated: "2025-11-08",
  },
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
    updated: "2025-11-06",
  },
  {
    slug: "online-voice-recorder",
    title: "Online Voice Recorder",
    description: "Record audio with your microphone, see the waveform and download the file.",
    category: "media",
    icon: "audio",
    status: "live",
    keywords: ["voice", "recorder", "microphone", "audio", "record"],
    updated: "2025-11-30",
  },
  {
    slug: "robot-game",
    title: "Robo-Friend Game",
    description: "A tiny interactive robot that reacts, plays mini-games and levels up.",
    category: "fun",
    icon: "bot",
    status: "live",
    keywords: ["robot", "game", "fun", "interactive"],
    updated: "2025-11-24",
  },
];

/** Everything rebuilt in the second wave, live as of this commit. */
export const plannedTools: Tool[] = [
  { slug: "unit-converter", title: "Unit Converter", description: "Length, mass, volume, area, speed, temperature and data sizes.", category: "convert", icon: "ruler", status: "live", keywords: ["convert", "units", "metric", "imperial"] },
  { slug: "percentage-calculator", title: "Percentage Calculator", description: "Percentages, increases, decreases and discounts, explained.", category: "math", icon: "percent", status: "live", keywords: ["percent", "percentage", "discount", "increase"] },
  { slug: "word-counter", title: "Word & Character Counter", description: "Words, characters, sentences and reading time as you type.", category: "text", icon: "type", status: "live", keywords: ["word count", "characters", "reading time"] },
  { slug: "text-case-converter", title: "Text Case Converter", description: "UPPER, lower, Title, Sentence and camelCase in one click.", category: "text", icon: "type", status: "live", keywords: ["uppercase", "lowercase", "title case", "camelcase"] },
  { slug: "remove-duplicate-lines", title: "Remove Duplicate Lines", description: "Deduplicate and sort lists, with counts of what was removed.", category: "text", icon: "list", status: "live", keywords: ["duplicate", "dedupe", "sort lines", "unique"] },
  { slug: "lorem-ipsum-generator", title: "Lorem Ipsum Generator", description: "Placeholder text by paragraph, sentence or word count.", category: "text", icon: "sparkles", status: "live", keywords: ["lorem", "ipsum", "placeholder", "dummy text"] },
  { slug: "base64-encoder", title: "Base64 Encoder / Decoder", description: "Encode and decode text or files, entirely in the browser.", category: "dev", icon: "code", status: "live", keywords: ["base64", "encode", "decode"] },
  { slug: "url-encoder", title: "URL Encoder / Decoder", description: "Percent-encode URLs and query strings, and read them back.", category: "dev", icon: "link", status: "live", keywords: ["url", "encode", "decode", "percent", "query string"] },
  { slug: "hash-generator", title: "Hash Generator", description: "SHA-1, SHA-256, SHA-384 and SHA-512 checksums via Web Crypto.", category: "dev", icon: "hash", status: "live", keywords: ["sha256", "hash", "checksum", "digest"] },
  { slug: "json-formatter", title: "JSON Formatter & Validator", description: "Pretty-print, minify and locate the exact error in broken JSON.", category: "dev", icon: "braces", status: "live", keywords: ["json", "format", "validate", "minify"] },
  { slug: "qr-code-generator", title: "QR Code Generator", description: "Create a QR code for a link, text, email or Wi-Fi network.", category: "dev", icon: "qr", status: "live", keywords: ["qr", "barcode", "wifi", "link"] },
  { slug: "date-difference-calculator", title: "Date Difference Calculator", description: "Days, weeks, months and working days between two dates.", category: "time", icon: "calendar", status: "live", keywords: ["date", "difference", "days between", "workdays"] },
  { slug: "age-calculator", title: "Age Calculator", description: "Your exact age in years, months, days and heartbeats.", category: "time", icon: "calendar", status: "live", keywords: ["age", "birthday", "date of birth"] },
  { slug: "countdown-timer", title: "Countdown Timer", description: "A precise countdown with a visible progress ring.", category: "time", icon: "timer", status: "live", keywords: ["countdown", "timer", "alarm"] },
  { slug: "stopwatch", title: "Stopwatch", description: "Start, stop and record laps with millisecond precision.", category: "time", icon: "clock", status: "live", keywords: ["stopwatch", "lap", "split", "timer"] },
  { slug: "random-number-generator", title: "Random Number Generator", description: "Unbiased random numbers, dice rolls and lottery draws.", category: "privacy", icon: "hash", status: "live", keywords: ["random", "dice", "lottery", "number"] },
  { slug: "password-strength-checker", title: "Password Strength Checker", description: "See how long a password would resist guessing, and why.", category: "privacy", icon: "shield", status: "live", keywords: ["password", "strength", "entropy", "crack time"] },
  { slug: "bmi-calculator", title: "BMI Calculator", description: "Body mass index with the WHO bands and their limitations.", category: "health", icon: "scale", status: "live", keywords: ["bmi", "body mass index", "healthy weight"] },
  { slug: "image-compressor", title: "Image Compressor", description: "Shrink JPEG, PNG and WebP files without uploading them.", category: "media", icon: "image", status: "live", keywords: ["compress", "image", "jpeg", "webp", "optimise"] },
  { slug: "image-resizer", title: "Image Resizer", description: "Resize and crop images to exact pixel dimensions in-browser.", category: "media", icon: "image", status: "live", keywords: ["resize", "crop", "image", "dimensions"] },
];

export const allTools: Tool[] = [...legacyTools, ...plannedTools];

export const urlOf = (tool: Tool): string => tool.url ?? `/${tool.slug}/`;

export const byCategory = (id: CategoryId): Tool[] =>
  allTools.filter((t) => t.category === id);

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
