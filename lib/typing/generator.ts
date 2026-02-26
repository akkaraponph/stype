/**
 * Test text generation: word lists and calm quotes.
 */

export type Language = "en" | "th";
export type WordLevel = "easy" | "medium" | "hard";

const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
];

const COMMON_WORDS_TH = [
  "เป็น", "มี", "ไป", "มา", "อยู่", "นี้", "ที่", "กับ", "ใน", "ได้", "เขา", "เรา", "เธอ", "ใคร", "อะไร", "อย่างไร", "เมื่อไหร่", "ทำ", "ดู", "กิน", "เรียน", "ทำงาน", "ดี", "ใหญ่", "เล็ก", "สวย", "เร็ว", "ช้า", "ใหม่", "เก่า", "มาก", "น้อย", "วัน", "เดือน", "ปี", "เวลา", "คน", "บ้าน", "อาหาร", "น้ำ", "เงิน", "หนังสือ", "รถ", "เมือง", "ประเทศ", "โลก", "ครอบครัว", "เพื่อน", "พ่อ", "แม่", "ลูก", "ครู", "นักเรียน", "งาน", "โรงเรียน", "มหาวิทยาลัย", "ที่", "หรือ", "แต่", "เพราะ", "ถ้า", "แล้ว", "ก็", "จะ", "ไม่", "ยัง", "อีก", "ทุก", "บาง", "มาก", "น้อย", "เลย", "เท่านั้น", "ด้วย", "กัน", "เอง", "เช่น", "เหมือน", "ต่าง", "กัน", "จริง", "แน่นอน", "อาจ", "ต้อง", "ควร", "สามารถ", "ชอบ", "รัก", "คิด", "รู้", "เข้าใจ", "บอก", "ถาม", "ตอบ", "เปิด", "ปิด", "เดิน", "นั่ง", "นอน", "ยืน", "วิ่ง", "อ่าน", "เขียน", "พูด", "ฟัง", "รอ", "หา", "ให้", "รับ", "ส่ง", "ซื้อ", "ขาย", "ใช้", "สร้าง", "เปลี่ยน", "เพิ่ม", "ลด", "เริ่ม", "จบ", "ต่อไป", "ก่อน", "หลัง", "ระหว่าง", "ข้าง", "บน", "ล่าง", "ใน", "นอก", "ใกล้", "ไกล", "สูง", "ต่ำ", "ยาว", "สั้น", "กว้าง", "แคบ", "หนา", "บาง", "หนัก", "เบา", "ร้อน", "เย็น", "สว่าง", "มืด", "สวย", "น่าเกลียด", "ง่าย", "ยาก", "ดี", "แย่", "ถูก", "ผิด", "จริง", "เท็จ",
];

function assignLevelEn(word: string): WordLevel {
  const len = word.length;
  if (len <= 3) return "easy";
  if (len <= 5) return "medium";
  return "hard";
}

function assignLevelTh(word: string): WordLevel {
  const len = word.length;
  if (len <= 2) return "easy";
  if (len <= 4) return "medium";
  return "hard";
}

function buildWordsByLevel(
  words: string[],
  assignLevel: (w: string) => WordLevel
): Record<WordLevel, string[]> {
  const easy: string[] = [];
  const medium: string[] = [];
  const hard: string[] = [];
  for (const w of words) {
    const level = assignLevel(w);
    if (level === "easy") easy.push(w);
    else if (level === "medium") medium.push(w);
    else hard.push(w);
  }
  return { easy, medium, hard };
}

const WORDS_BY_LEVEL_EN = buildWordsByLevel(COMMON_WORDS, assignLevelEn);
const WORDS_BY_LEVEL_TH = buildWordsByLevel(COMMON_WORDS_TH, assignLevelTh);

const WORDS_BY_LEVEL: Record<Language, Record<WordLevel, string[]>> = {
  en: WORDS_BY_LEVEL_EN,
  th: WORDS_BY_LEVEL_TH,
};

const CALM_QUOTES = [
  "Breathe in calm, breathe out stress.",
  "Slow and steady wins the race.",
  "Peace comes from within.",
  "One key at a time, one word at a time.",
  "Patience is the key to clarity.",
];

const CALM_QUOTES_TH = [
  "หายใจเข้า สบาย หายใจออก ปล่อยความเครียด",
  "ช้าและมั่นคงชนะการแข่งขัน",
  "ความสงบมาจากภายใน",
  "ทีละปุ่ม ทีละคำ",
  "ความอดทนคือกุญแจสู่ความชัดเจน",
];

function pickFromLevels(
  byLevel: Record<WordLevel, string[]>,
  levels: WordLevel[]
): string[] {
  const pool: string[] = [];
  for (const level of levels) {
    const list = byLevel[level];
    if (list?.length) pool.push(...list);
  }
  return pool.length ? pool : [...byLevel.easy, ...byLevel.medium, ...byLevel.hard];
}

/**
 * Generate a string of `count` words from the given language and levels.
 * If `levels` is empty or not provided, all levels are used.
 * Optional `extraWords` are merged into the pool (e.g. user custom words).
 */
export function getWords(
  count: number,
  lang: Language = "en",
  levels: WordLevel[] = ["easy", "medium", "hard"],
  extraWords: string[] = []
): string {
  const byLevel = WORDS_BY_LEVEL[lang];
  const pool = levels.length
    ? pickFromLevels(byLevel, levels)
    : [...byLevel.easy, ...byLevel.medium, ...byLevel.hard];
  const fullPool = extraWords.length ? [...pool, ...extraWords] : pool;
  if (fullPool.length === 0) return "";
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * fullPool.length);
    words.push(fullPool[idx]!);
  }
  return words.join(" ");
}

export function getQuote(lang: Language = "en"): string {
  const list = lang === "th" ? CALM_QUOTES_TH : CALM_QUOTES;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx]!;
}
