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
    slug: "التقويم-الهجري",
    title: "محوّل التقويم الهجري والميلادي",
    nav: "التقويم الهجري",
    description:
      "حوّل أي تاريخ بين الهجري والميلادي، واحسب عمرك بالسنوات الهجرية، مع فروق التواريخ.",
    category: "time",
    icon: "calendar",
    status: "live",
    keywords: ["التقويم الهجري", "تحويل التاريخ", "التاريخ الهجري اليوم", "العمر بالهجري"],
    published: "2026-10-15",
    publishedTime: "15:38",
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
