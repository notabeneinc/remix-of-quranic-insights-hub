// src/lib/quranRoots.ts

export type WordMorphology = {
  root: string;       // মূল ধাতু (যেমন: ك ف ر)
  lemma: string;      // ক্রিয়ামূল (যেমন: كَفَرَ)
  pos: string;        // পদ (ক্রিয়া, বিশেষ্য, সর্বনাম ইত্যাদি)
  meaning_bn: string; // সঠিক বাংলা অর্থ
};

/** 
 * গ্রীনটেক মরফোলজি ডাটাবেজের মূল ম্যাপিং
 * সাধারণ রূপগুলোকে নরমালাইজড করে রাখা হয়েছে
 */
export const MORPHOLOGY_MAP: Record<string, WordMorphology> = {
  // كفر সংক্রান্ত
  "كفروا": { root: "ك ف ر", lemma: "كَفَرَ", pos: "ক্রিয়া · সর্বনাম", meaning_bn: "অস্বীকার করেছে" },
  "كفر": { root: "ك ف ر", lemma: "كَفَرَ", pos: "ক্রিয়া", meaning_bn: "কুফরি করেছে / অস্বীকার করেছে" },
  "الكافرين": { root: "ك ف ر", lemma: "كَافِر", pos: "বিশেষ্য", meaning_bn: "কাফেররা / অস্বীকারকারীরা" },
  "كفار": { root: "ك ف ر", lemma: "كَافِر", pos: "বিশেষ্য", meaning_bn: "অবিশ্বাসীরা" },

  // عوذ সংক্রান্ত
  "اعوذ": { root: "ع و ذ", lemma: "عَاذَ", pos: "ক্রিয়া", meaning_bn: "আমি আশ্রয় চাই" },
  "معاذ": { root: "ع و ذ", lemma: "مَعَاذ", pos: "বিশেষ্য", meaning_bn: "আশ্রয়স্থল" },

  // سجد সংক্রান্ত
  "المسجد": { root: "س ج د", lemma: "مَسْجِد", pos: "বিশেষ্য", meaning_bn: "মসজিদ / সেজদার স্থান" },
  "مسجد": { root: "س ج د", lemma: "مَسْجِد", pos: "বিশেষ্য", meaning_bn: "মসজিদ" },
  "فاسجدوا": { root: "س ج د", lemma: "سَجَدَ", pos: "ক্রিয়া (আদেশসূচক)", meaning_bn: "সুতরাং তোমরা সেজদা করো" },
  "يسجدون": { root: "س ج د", lemma: "سَجَدَ", pos: "ক্রিয়া", meaning_bn: "তারা সেজদা করে" },

  // نفل সংক্রান্ত
  "الانفال": { root: "ن ف ل", lemma: "نَفَل", pos: "বিশেষ্য", meaning_bn: "যুদ্ধলব্ধ সম্পদ" },

  // بين সংক্রান্ত
  "بينكم": { root: "ب ي ن", lemma: "بَيْنَ", pos: "অব্যয় · সর্বনাম", meaning_bn: "তোমাদের মাঝে / পরস্পরের মধ্যে" },
  "بينهم": { root: "ب ي ن", lemma: "بَيْنَ", pos: "অব্যয় · সর্বনাম", meaning_bn: "তাদের মাঝে" },
  "بين": { root: "ب ي ن", lemma: "بَيْنَ", pos: "অব্যয়", meaning_bn: "মধ্যে / মাঝে" },

  // كتب সংক্রান্ত
  "كتب": { root: "ك ت ب", lemma: "كَتَبَ", pos: "ক্রিয়া", meaning_bn: "লিখেছেন / বিধিবদ্ধ করেছেন" },
  "الكتاب": { root: "ك ت ب", lemma: "كِتَاب", pos: "বিশেষ্য", meaning_bn: "কিতাব / গ্রন্থ" },

  // رحم সংক্রান্ত
  "الرحمن": { root: "ر ح م", lemma: "رَحْمَٰن", pos: "বিশেষণ", meaning_bn: "পরম করুণাময়" },
  "الرحيم": { root: "ر ح م", lemma: "رَحِيم", pos: "বিশেষণ", meaning_bn: "অসীম দয়ালু" },
  "رحمة": { root: "ر ح م", lemma: "رَحْمَة", pos: "বিশেষ্য", meaning_bn: "রহমত / দয়া" },
};

/** আরবি অক্ষর ক্লিন করার ফাংশন */
export function cleanArabicLetters(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[يىئ]/g, "ي")
    .replace(/[ة]/g, "ه")
    .replace(/[ؤ]/g, "و")
    .replace(/[^\u0621-\u064A]/g, "")
    .trim();
}

/** শব্দ থেকে স্বয়ংক্রিয়ভাবে গ্রীনটেক মরফোলজি ডাটা পাওয়ার হেল্পার */
export function getWordMorphology(rawWord: string): WordMorphology {
  const clean = cleanArabicLetters(rawWord);
  
  if (MORPHOLOGY_MAP[clean]) {
    return MORPHOLOGY_MAP[clean];
  }

  // যদি সরাসরি ডিকশনারিতে না থাকে, তবে স্মার্ট ফলব্যাক রুট তৈরি
  const trimmed = clean.startsWith("ال") ? clean.slice(2) : clean;
  const rootEstimate = trimmed.slice(0, 3).split("").join(" ");

  return {
    root: rootEstimate || "—",
    lemma: trimmed || rawWord,
    pos: "শব্দ",
    meaning_bn: "শব্দার্থ লোড হচ্ছে...",
  };
}