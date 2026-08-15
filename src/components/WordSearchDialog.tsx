import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, BookOpen } from "lucide-react";

import { localNumber } from "@/lib/quran";
import { usePrefs } from "@/lib/prefs";
import { QuranWord } from "@/lib/quranService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  selectedWord: {
    surah: number;
    ayah: number;
    word: QuranWord;
  } | null;
  onClose: () => void;
};

export function WordSearchDialog({ selectedWord, onClose }: Props) {
  const { lang } = usePrefs();
  const [searchType, setSearchType] = useState<"word" | "root">("word");

  if (!selectedWord) return null;
  const { word, surah, ayah } = selectedWord;

  return (
    <Dialog open={!!selectedWord} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl p-0 gap-0 border-border/80 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20 text-center">
          {/* ১. পদ বা ব্যাকরণগত ট্যাগ */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {word.grammar_bn || "শব্দ"}
            </span>
          </div>

          {/* ২. মূল আরবি শব্দ */}
          <DialogTitle className="arabic text-4xl text-foreground font-bold tracking-wide my-1">
            {word.text_uthmani}
          </DialogTitle>

          {/* ৩. উচ্চারণ ও বাংলা অনুবাদ */}
          {word.transliteration && (
            <p className="text-xs italic text-muted-foreground font-mono">
              [{word.transliteration}]
            </p>
          )}
          <p className="text-base font-semibold text-foreground/90 mt-1">
            "{word.translation_bn}"
          </p>

          {/* ৪. গ্রীনটেক রুট ও ক্রিয়ামূল কার্ড */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mt-4">
            <div className="rounded-xl border border-border/70 bg-card p-2.5 text-center shadow-2xs">
              <span className="text-[11px] text-muted-foreground block mb-0.5">ক্রিয়ামূল:</span>
              <span className="arabic text-base font-bold text-foreground">
                {word.lemma || word.text_uthmani}
              </span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-2.5 text-center shadow-2xs">
              <span className="text-[11px] text-muted-foreground block mb-0.5">মূল (Root):</span>
              <span className="arabic text-base font-bold text-amber-500">
                {word.root || "—"}
              </span>
            </div>
          </div>

          {/* ৫. মোড সুইচ টগল */}
          <div className="flex items-center justify-center gap-1 mt-4 p-1 rounded-xl bg-muted/80 w-fit mx-auto border border-border/60">
            <button
              type="button"
              onClick={() => setSearchType("word")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                searchType === "word"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="size-3.5" /> হুবহু এই শব্দ
            </button>
            <button
              type="button"
              onClick={() => setSearchType("root")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                searchType === "root"
                  ? "bg-background text-primary shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="size-3.5 text-amber-500" /> মূল রুট ({word.root})
            </button>
          </div>
        </DialogHeader>

        {/* অবস্থান তথ্য */}
        <div className="p-5 text-center text-xs text-muted-foreground">
          অবস্থান: সুরা {localNumber(surah, lang)} : আয়াত {localNumber(ayah, lang)} · শব্দ নম্বর {localNumber(word.position, lang)}
        </div>
      </DialogContent>
    </Dialog>
  );
}