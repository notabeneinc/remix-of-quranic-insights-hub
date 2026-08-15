// src/lib/quranService.ts

export type QuranWord = {
  id: number;
  position: number;
  text_uthmani: string;
  transliteration: string;
  translation_bn: string;
  translation_en?: string;
  root: string;       // গ্রীনটেক খাঁটি রুট (যেমন: ن ف ل)
  lemma: string;      // ক্রিয়ামূল (যেমন: نَفَل)
  grammar_bn: string; // পদ (যেমন: বিশেষ্য, ক্রিয়া)
};

export type QuranAyah = {
  surah: number;
  ayah: number;
  text_uthmani: string;
  words: QuranWord[];
};

export type SurahMeta = {
  id: number;
  name_ar: string;
  name_bn: string;
  name_en: string;
  total_ayahs: number;
  type: "Meccan" | "Medinan";
};

/**
 * গ্রীনটেক লোকাল ডাটাবেজ থেকে সম্পূর্ণ সুরা লোড করা
 */
export async function fetchSurahFromGreentech(surahId: number): Promise<{
  surah: SurahMeta;
  ayahs: QuranAyah[];
}> {
  const response = await fetch(`/data/quran/surahs/${surahId}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load Greentech data for Surah ${surahId}`);
  }
  return response.json();
}

/**
 * গ্রীনটেক ডাটাবেজে রুট (Root) বা শব্দ দিয়ে দ্রুত সন্ধান
 */
export async function searchGreentech(
  query: string,
  mode: "word" | "root"
): Promise<QuranAyah[]> {
  const response = await fetch(`/data/quran/index/${mode === "root" ? "roots" : "words"}.json`);
  if (!response.ok) return [];
  const indexData = await response.json();
  return indexData[query] || [];
}