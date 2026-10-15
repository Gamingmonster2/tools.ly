/**
 * Arabic edition registry.
 *
 * These are NOT translations of the English tools. Each entry is a tool that exists
 * because Arabic-speaking users need it, and most have no English counterpart at all.
 * When a genuine counterpart does exist, set `enSlug` and the layout will emit reciprocal
 * `hreflang`; when it does not, nothing is emitted and no duplicate-content signal exists.
 */

export type ArToolStatus = "live" | "soon";

export interface ArTool {
  /** Arabic slug, without diacritics. Becomes /ar/<slug>/. */
  slug: string;
  title: string;
  /** Short label for cards and navigation. */
  nav?: string;
  description: string;
  category: ArCategoryId;
  icon: string;
  status: ArToolStatus;
  keywords?: string[];
  published: string;
  publishedTime: string;
  updated?: string;
  /** Slug of the English tool this is a genuine counterpart of, if any. */
  enSlug?: string;
}

export type ArCategoryId =
  | "text"
  | "time"
  | "math"
  | "files"
  | "fonts"
  | "religion"
  | "convert";

export const arCategories: { id: ArCategoryId; label: string; blurb: string }[] = [
  { id: "text", label: "النصوص العربية", blurb: "عدّ، تنظيف، تشكيل وتحويل النصوص العربية." },
  { id: "time", label: "التاريخ والوقت", blurb: "التقويم الهجري، الأعمار، الفروق بين التواريخ." },
  { id: "math", label: "الحاسبات", blurb: "حاسبات يومية: الخصم، النسبة، القروض." },
  { id: "files", label: "الملفات والصور", blurb: "PDF والصور، بلا رفع إلى أي خادم." },
  { id: "fonts", label: "الخطوط والتصميم", blurb: "معاينة الخطوط العربية ولوحات الألوان." },
  { id: "religion", label: "أدوات دينية", blurb: "مواقيت، تقويم، وأدوات مرتبطة بالعبادات." },
  { id: "convert", label: "التحويلات", blurb: "وحدات، أرقام، صيغ وتواريخ." },
];

export const arTools: ArTool[] = [
  {
    slug: "عداد-الحروف",
    title: "عدّاد الحروف والكلمات للنصوص العربية",
    nav: "عدّاد الحروف",
    description:
      "الصق نصاً عربياً واحصل على عدد الحروف والكلمات والجمل ووقت القراءة، مع تفصيل الحروف.",
    category: "text",
    icon: "type",
    status: "live",
    keywords: ["عدد الحروف", "عد الكلمات", "عدّاد الكلمات العربي", "حساب الكلمات"],
    published: "2026-10-15",
    publishedTime: "10:12",
  },
  {
    // Intent: CONVERSION. The title, description and keywords all use the phrasing people
    // actually type when they want one date turned into another.
    slug: "التقويم-الهجري",
    title: "تحويل التاريخ الهجري إلى ميلادي والعكس",
    nav: "تحويل التاريخ الهجري",
    description:
      "التاريخ الهجري اليوم يظهر فور فتح الصفحة. حوّل أي تاريخ بين الهجري والميلادي في ثانية، واعرف يوم الأسبوع وفروق التواريخ — محوّل يعمل داخل متصفحك بلا تسجيل.",
    category: "time",
    icon: "calendar",
    status: "live",
    keywords: [
      "تحويل التاريخ الهجري الى ميلادي",
      "التاريخ الهجري اليوم",
      "محول التاريخ الهجري",
      "التقويم الهجري والميلادي",
      "كم تاريخ اليوم بالهجري",
      "تحويل الميلادي الى هجري",
    ],
    published: "2026-10-15",
    publishedTime: "15:38",
  },
  {
    // Intent: AGE. A separate page on purpose. Someone typing "احسب عمري بالهجري" wants an
    // answer to one question, not a date converter that happens to contain an age section.
    // Google ranks the page whose PRIMARY topic matches the query, so a section inside
    // another tool will always be weaker than a page about that one thing.
    slug: "احسب-عمرك-بالهجري",
    title: "احسب عمري بالهجري — حاسبة العمر بالتقويم الهجري والميلادي",
    nav: "احسب عمري بالهجري",
    description:
      "كم عمري بالهجري الآن؟ اكتب تاريخ ميلادك واعرف عمرك فوراً بالسنوات والأشهر والأيام الهجرية، وعمرك الميلادي، وكم يوماً بقي حتى عيد ميلادك الهجري القادم.",
    category: "time",
    icon: "calendar",
    status: "live",
    keywords: [
      "احسب عمري بالهجري",
      "كم عمري بالهجري",
      "كيف احسب عمري بالهجري",
      "حاسبة العمر بالهجري",
      "حساب العمر بالهجري والميلادي",
      "احسب عمرك بالهجري",
      "عمري بالتقويم الهجري",
    ],
    published: "2026-10-15",
    publishedTime: "16:20",
  },
  {
    slug: "إزالة-التشكيل",
    title: "إزالة التشكيل من النص العربي",
    nav: "إزالة التشكيل",
    description: "احذف الحركات والتشكيل من أي نص عربي بضغطة واحدة، مع خيار إبقاء الهمزات.",
    category: "text",
    icon: "sparkles",
    status: "soon",
    keywords: ["إزالة التشكيل", "حذف الحركات", "تنظيف النص العربي"],
    published: "2026-10-20",
    publishedTime: "11:05",
  },
  {
    slug: "حاسبة-الخصم",
    title: "حاسبة الخصم والنسبة المئوية",
    nav: "حاسبة الخصم",
    description: "احسب السعر بعد الخصم، ونسبة الزيادة، والفرق بين سعرين في ثوانٍ.",
    category: "math",
    icon: "percent",
    status: "soon",
    keywords: ["حاسبة الخصم", "نسبة الخصم", "السعر بعد الخصم"],
    published: "2026-10-27",
    publishedTime: "14:20",
  },
  {
    slug: "تحويل-الأرقام-الهندية",
    title: "تحويل الأرقام بين العربية والإنجليزية",
    nav: "تحويل الأرقام",
    description: "حوّل الأرقام الهندية (٠١٢٣) إلى أرقام عربية (0123) والعكس، داخل أي نص.",
    category: "convert",
    icon: "hash",
    status: "soon",
    keywords: ["الأرقام الهندية", "تحويل الأرقام العربية", "٠١٢٣"],
    published: "2026-11-03",
    publishedTime: "09:47",
  },
  {
    slug: "عارض-الخطوط-العربية",
    title: "معاينة الخطوط العربية",
    nav: "الخطوط العربية",
    description: "اعرض نصك بخطوط عربية مختلفة، وقارن الأحجام والأوزان قبل الاختيار.",
    category: "fonts",
    icon: "palette",
    status: "soon",
    keywords: ["الخطوط العربية", "معاينة خط", "تجربة خطوط"],
    published: "2026-11-10",
    publishedTime: "13:33",
  },
];

export const arLocale = "ar" as const;

export const arUrlOf = (tool: ArTool): string => `/ar/${tool.slug}/`;

export const arNewest = (tools: ArTool[] = arTools): ArTool[] =>
  [...tools].sort((a, b) =>
    b.published.localeCompare(a.published) || b.publishedTime.localeCompare(a.publishedTime)
  );

export const arLiveCount = arTools.filter((t) => t.status === "live").length;

export const arRelated = (tool: ArTool, limit = 4): ArTool[] =>
  arTools
    .filter((t) => t.slug !== tool.slug && t.status === "live")
    .sort((a, b) => {
      const aScore = a.category === tool.category ? 0 : 1;
      const bScore = b.category === tool.category ? 0 : 1;
      return aScore - bScore || a.title.localeCompare(b.title, "ar");
    })
    .slice(0, limit);
