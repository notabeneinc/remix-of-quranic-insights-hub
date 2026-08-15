// scripts/fetch-greentech-quran.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "../public/data/quran/surahs");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("🚀 গ্রীনটেক ও সম্পূর্ণ কুরআন ডাটা (শব্দার্থ, রুট, পূর্ণ অনুবাদ ও উচ্চারণ) ডাউনলোড শুরু হচ্ছে...");

async function downloadSurah(surahId) {
  try {
    // translations=161 (Taisirul Quran Bengali), 163 (Muhiuddin Khan)
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=bn&words=true&word_fields=text_uthmani,text_imlaei,location&translations=161&per_page=300`
    );
    if (!res.ok) throw new Error(`Surah ${surahId} fetch failed`);
    
    const json = await res.json();
    const processed = {
      surah: surahId,
      ayahs: json.verses.map((v) => {
        const words = (v.words || []).map((w, idx) => ({
          id: w.id,
          position: idx + 1,
          text_uthmani: w.text_uthmani || w.text,
          transliteration: w.transliteration?.text || "",
          translation_bn: w.translation?.text || "",
          root: w.root || "—",
          lemma: w.lemma || w.text_uthmani,
          grammar_bn: w.char_type_name === "word" ? "শব্দ" : "মার্কার",
        }));

        // পূর্ণ আয়াতের উচ্চারণ
        const fullTransliteration = words
          .filter((w) => w.grammar_bn === "শব্দ" && w.transliteration)
          .map((w) => w.transliteration)
          .join(" ");

        // পূর্ণ আয়াতের বাংলা অনুবাদ
        const rawTranslation = v.translations?.[0]?.text || "";
        const cleanTranslation = rawTranslation.replace(/<sup.*?<\/sup>/g, "").trim();

        return {
          surah: surahId,
          ayah: v.verse_number,
          text_uthmani: v.text_uthmani,
          transliteration: fullTransliteration,
          translation_bn: cleanTranslation,
          words,
        };
      }),
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${surahId}.json`),
      JSON.stringify(processed, null, 2)
    );
  } catch (error) {
    console.error(`❌ সুরা ${surahId} ডাউনলোডে ত্রুটি:`, error.message);
  }
}

async function run() {
  for (let i = 1; i <= 114; i++) {
    process.stdout.write(`⏳ প্রসেস হচ্ছে: সুরা ${i}/114 ... \r`);
    await downloadSurah(i);
  }
  console.log("\n✅ আলহামদুলিল্লাহ! ১১৪টি সূরার পূর্ণ অনুবাদ, উচ্চারণ ও শব্দার্থ প্রস্তুত হয়েছে!");
}

run();