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
  | "audio";

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

/** The next wave: browser-only tools shown as "coming soon" until built. */
export const plannedTools: Tool[] = [
  { slug: "bmi-calculator", title: "BMI Calculator", description: "Body mass index with healthy-range guidance.", category: "health", icon: "scale", status: "soon" },
  { slug: "percentage-calculator", title: "Percentage Calculator", description: "Everyday percentage, increase and discount math.", category: "math", icon: "percent", status: "soon" },
  { slug: "unit-converter", title: "Unit Converter", description: "Length, mass, volume, speed and temperature.", category: "convert", icon: "ruler", status: "soon" },
  { slug: "word-counter", title: "Word & Character Counter", description: "Words, characters, sentences and reading time.", category: "text", icon: "type", status: "soon" },
  { slug: "qr-code-generator", title: "QR Code Generator", description: "Create QR codes for links, text and Wi-Fi.", category: "dev", icon: "qr", status: "soon" },
  { slug: "date-difference-calculator", title: "Date Difference Calculator", description: "Days, weeks and months between two dates.", category: "time", icon: "calendar", status: "soon" },
  { slug: "countdown-timer", title: "Countdown Timer", description: "A precise timer with sound alerts.", category: "time", icon: "timer", status: "soon" },
  { slug: "base64-encoder", title: "Base64 Encoder / Decoder", description: "Encode and decode text or files instantly.", category: "dev", icon: "code", status: "soon" },
  { slug: "image-compressor", title: "Image Compressor", description: "Shrink images without uploading them anywhere.", category: "media", icon: "image", status: "soon" },
  { slug: "random-number-generator", title: "Random Number Generator", description: "Random numbers, dice and lottery draws.", category: "privacy", icon: "hash", status: "soon" },
  { slug: "password-strength-checker", title: "Password Strength Checker", description: "See how long a password would take to crack.", category: "privacy", icon: "shield", status: "soon" },
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
