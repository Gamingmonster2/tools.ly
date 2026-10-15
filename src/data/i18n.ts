/**
 * Bilingual foundation.
 *
 * The two language editions are NOT translations of each other. English pages live at the
 * site root and Arabic pages under `/ar/`, and each edition carries the tools that make
 * sense for its audience — the Hijri calendar and Arabic text tools exist only in Arabic,
 * while most English tools have no Arabic twin. `hreflang` is therefore emitted only when a
 * real counterpart is declared, never guessed.
 *
 * Adding a language means adding one entry here plus a routed copy of the shell.
 */

export type Locale = "en" | "ar";

export const defaultLocale: Locale = "en";

export interface LocaleMeta {
  code: Locale;
  /** BCP-47 tag for <html lang> and hreflang. */
  htmlLang: string;
  dir: "ltr" | "rtl";
  /** Path prefix, empty for the default locale. */
  prefix: string;
  /** Name of the language, written in that language. */
  endonym: string;
  /** Name of the language, written in the language of the current page. */
  label: string;
  /** Locale used for number and date formatting. */
  formatLocale: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    code: "en",
    htmlLang: "en",
    dir: "ltr",
    prefix: "",
    endonym: "English",
    label: "English",
    formatLocale: "en-GB",
  },
  ar: {
    code: "ar",
    htmlLang: "ar",
    dir: "rtl",
    prefix: "/ar",
    endonym: "العربية",
    label: "العربية",
    formatLocale: "ar-EG",
  },
};

export const locales: Locale[] = ["en", "ar"];

/** "/unit-converter/" for en, "/ar/unit-converter/" for ar. */
export const localePath = (locale: Locale, path: string): string => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${localeMeta[locale].prefix}${clean}`;
};

/** The other locale, used by the language switcher. */
export const otherLocale = (locale: Locale): Locale => (locale === "en" ? "ar" : "en");

interface NavItem {
  href: string;
  label: string;
}

interface Strings {
  nav: NavItem[];
  allTools: string;
  skipToContent: string;
  themeToggle: string;
  languageSwitch: string;
  /** Shown when the current page has no counterpart in the other language. */
  languageFallbackNote: string;
  footerAbout: string;
  footerPopular: string;
  footerCategories: string;
  footerSite: string;
  footerRights: string;
  footerBuilt: string;
  bylinePrefix: string;
  publishedPrefix: string;
  updatedPrefix: string;
  worksOffline: string;
  relatedTools: string;
  privacyTitle: string;
  privacyBody: string;
  faqTitle: string;
  sourcesTitle: string;
  home: string;
  /** The soft Telegram bar. See the note in TelegramBar.astro for why it is a bar. */
  telegramTitle: string;
  telegramBody: string;
  telegramCta: string;
  telegramDismiss: string;
  telegramFooter: string;
}

export const strings: Record<Locale, Strings> = {
  en: {
    nav: [
      { href: "/", label: "Home" },
      { href: "/all-tools/", label: "All tools" },
      { href: "/7b3c2-blog-archive/", label: "Blog" },
      { href: "/7b3c2-about/", label: "About" },
      { href: "/7b3c2-contact/", label: "Contact" },
    ],
    allTools: "All tools",
    skipToContent: "Skip to content",
    themeToggle: "Switch color theme",
    languageSwitch: "Change language",
    languageFallbackNote: "This page has no Arabic edition yet — you will go to the Arabic home page.",
    footerAbout:
      "Free browser-based tools. Everything runs on your device — nothing to install, nothing uploaded.",
    footerPopular: "Popular tools",
    footerCategories: "Categories",
    footerSite: "Site",
    footerRights: "all tools are free to use.",
    footerBuilt: "Built with static HTML. No trackers, no accounts, no uploads.",
    bylinePrefix: "By",
    publishedPrefix: "Published",
    updatedPrefix: "Updated",
    worksOffline: "Works offline",
    relatedTools: "Related tools",
    privacyTitle: "Privacy",
    privacyBody:
      "This tool runs entirely in your browser. Nothing you type is sent to a server, and there is no account to create.",
    faqTitle: "Frequently asked questions",
    sourcesTitle: "Sources & further reading",
    home: "Home",
    telegramTitle: "Follow Tools.ly on Telegram",
    telegramBody: "New tools and short tips, published in Arabic a few times a week.",
    telegramCta: "Open the channel",
    telegramDismiss: "Dismiss this",
    telegramFooter: "Telegram channel",
  },
  ar: {
    nav: [
      { href: "/ar/", label: "الرئيسية" },
      { href: "/ar/كل-الأدوات/", label: "كل الأدوات" },
      { href: "/ar/عن-الموقع/", label: "عن الموقع" },
      { href: "/ar/اتصل-بنا/", label: "اتصل بنا" },
    ],
    allTools: "كل الأدوات",
    skipToContent: "تجاوز إلى المحتوى",
    themeToggle: "تبديل مظهر الألوان",
    languageSwitch: "تغيير اللغة",
    languageFallbackNote: "لا توجد نسخة عربية لهذه الصفحة بعد — ستنتقل إلى الصفحة الرئيسية العربية.",
    footerAbout:
      "أدوات مجانية تعمل داخل متصفحك. لا شيء يُثبَّت، ولا شيء يُرفع إلى أي خادم.",
    footerPopular: "الأدوات الأكثر استخداماً",
    footerCategories: "التصنيفات",
    footerSite: "الموقع",
    footerRights: "جميع الأدوات مجانية للاستخدام.",
    footerBuilt: "مبني بصفحات ثابتة. بلا متتبّعات، بلا حسابات، بلا رفع ملفات.",
    bylinePrefix: "من",
    publishedPrefix: "نُشرت في",
    updatedPrefix: "حُدِّثت في",
    worksOffline: "تعمل دون إنترنت",
    relatedTools: "أدوات ذات صلة",
    privacyTitle: "الخصوصية",
    privacyBody:
      "تعمل هذه الأداة بالكامل داخل متصفحك. لا يُرسل أي شيء تكتبه إلى أي خادم، ولا حاجة لإنشاء حساب.",
    faqTitle: "أسئلة متكرّرة",
    sourcesTitle: "المصادر وقراءات إضافية",
    home: "الرئيسية",
    telegramTitle: "تابع Tools.ly على تيليجرام",
    telegramBody: "أدوات جديدة ونصائح قصيرة، مرّتين في الأسبوع. بلا إزعاج، ويمكنك المغادرة متى شئت.",
    telegramCta: "افتح القناة",
    telegramDismiss: "إخفاء هذا الشريط",
    telegramFooter: "قناة تيليجرام",
  },
};

export const t = (locale: Locale): Strings => strings[locale];
