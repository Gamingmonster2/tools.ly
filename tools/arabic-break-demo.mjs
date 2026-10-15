/**
 * Demonstrates the three ways Arabic text arrives broken, using the real Unicode
 * transformations rather than a description of them. Run:
 *
 *   node tools/arabic-break-demo.mjs
 *
 * It also proves the repair is possible: each broken form is reconstructed FROM clean
 * text and then recovered, so the tool's logic can be tested before it is written.
 */
const sample = "محمد السلام";

const codepoints = (text) =>
  [...text].map((ch) => "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));

console.log("النص السليم:", sample);
console.log("نقاط الترميز:", codepoints(sample).join(" "));

// ---------- 1) mojibake: UTF-8 bytes decoded as Latin-1 ----------
const mojibake = Buffer.from(sample, "utf8").toString("latin1");
const recoveredFromMojibake = Buffer.from(mojibake, "latin1").toString("utf8");
console.log("\n1) رموز غريبة (mojibake)");
console.log("   الشكل التالف :", mojibake);
console.log("   الاسترجاع   :", recoveredFromMojibake);
console.log("   العملية     : Buffer(mojibake, 'latin1').toString('utf8')");
console.log("   نجح؟        :", recoveredFromMojibake === sample);

// ---------- 2) presentation forms ----------
// Arabic Presentation Forms encode the SHAPE of a letter, not the letter. They are what a
// PDF or a non-shaping app leaves behind. Build the map from Unicode itself rather than
// hard-coding codepoints: every presentation form has a compatibility decomposition back
// to its base letter, so the reverse map is derived, not guessed.
const presentationByBase = new Map();
for (let cp = 0xfb50; cp <= 0xfeff; cp += 1) {
  const ch = String.fromCodePoint(cp);
  const base = ch.normalize("NFKC");
  if (base === ch || [...base].length !== 1) continue;
  if (!presentationByBase.has(base)) presentationByBase.set(base, ch);
}

const presentation = [...sample]
  .map((ch) => presentationByBase.get(ch) ?? ch)
  .join("");
const recoveredFromPresentation = presentation.normalize("NFKC");

console.log("\n2) أشكال العرض (presentation forms)");
console.log("   الأصل       :", sample);
console.log("   الشكل التالف :", presentation);
console.log("   نقاط الترميز :", codepoints(presentation).join(" "));
console.log("   بعد NFKC    :", recoveredFromPresentation);
console.log("   نجح؟        :", recoveredFromPresentation === sample);

// ---------- 3) reversal (visual instead of logical order) ----------
const reversed = [...sample].reverse().join("");
const recoveredByReversing = [...reversed].reverse().join("");
console.log("\n3) النص المقلوب (ترتيب بصري بدل منطقي)");
console.log("   الأصلي      :", sample);
console.log("   المقلوب     :", reversed);
console.log("   بعد العكس   :", recoveredByReversing);
console.log("   ملاحظة مهمة : العكس يُصلح حرفاً بحرف، لكن PDF غالباً يقلب ترتيب الكلمات والفواصل فقط —");
console.log("                 ولهذا يحتاج الإصلاح الحقيقي إلى معالجة أجزاء النص (Bidi) لا عكساً أعمى.");

// ---------- 4) why it matters ----------
console.log("\n=== لماذا يهمّ ===");
const clean = "محمد";
console.log("البحث عن '" + clean + "' داخل النص السليم      :", sample.includes(clean) ? "نجح" : "فشل");
console.log("البحث عن '" + clean + "' داخل أشكال العرض    :", presentation.includes(clean) ? "نجح" : "فشل");
console.log("الفرق في نقاط الترميز بين الكلمتين:");
console.log("  سليم       :", codepoints(clean).join(" "));
console.log("  أشكال عرض  :", codepoints([...presentation].slice(0, 4).join("")).join(" "));
console.log("→ نفس الكلمة، ست نقاط ترميز مختلفة تماماً. ولهذا تفشل عليها:");
console.log("  البحث، والتدقيق الإملائي، وعدّ الحروف، وفرز الجداول، وكل برنامج آخر.");
