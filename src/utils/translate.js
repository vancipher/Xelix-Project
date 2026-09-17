/**
 * Translate Arabic text to English for schedule events.
 * Uses MyMemory (no API key). Falls back to the original text on failure.
 */
const GLOSSARY = [
  [/حساب التفاضل( والتكامل)?/g, 'Calculus'],
  [/شبكات الحاسوب/g, 'Computer Networks'],
  [/أمن المعلومات/g, 'Information Security'],
  [/قواعد البيانات/g, 'Databases'],
  [/هندسة البرمجيات/g, 'Software Engineering'],
  [/الذكاء الاصطناعي/g, 'Artificial Intelligence'],
  [/تطوير الويب/g, 'Web Development'],
  [/نظم التشغيل/g, 'Operating Systems'],
  [/الخوارزميات/g, 'Algorithms'],
  [/امتحان منتصف الفصل/g, 'Midterm Exam'],
  [/امتحان نهائي/g, 'Final Exam'],
  [/اختبار مفاجئ/g, 'Pop Quiz'],
  [/اختبار قصير/g, 'Quiz'],
  [/واجب/g, 'Assignment'],
  [/تقرير/g, 'Report'],
  [/مختبر/g, 'Lab'],
  [/محاضرة/g, 'Lecture'],
  [/قاعة/g, 'Hall'],
];

function applyGlossary(text) {
  let out = text;
  for (const [pattern, en] of GLOSSARY) {
    out = out.replace(pattern, en);
  }
  return out;
}

function hasArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

async function fetchMyMemory(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText?.trim();
  if (!translated) throw new Error('empty translation');
  // MyMemory sometimes echoes the source when it fails
  if (translated === text) throw new Error('untranslated');
  return translated;
}

/**
 * @param {string} text Arabic (or mixed) source
 * @returns {Promise<string>} English title
 */
export async function translateArToEn(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';
  if (!hasArabic(trimmed)) return trimmed;

  const glossaryPass = applyGlossary(trimmed);
  if (!hasArabic(glossaryPass)) return glossaryPass;

  try {
    return await fetchMyMemory(glossaryPass);
  } catch {
    // Prefer a partial glossary rewrite over leaving raw Arabic in the EN field
    return glossaryPass;
  }
}
