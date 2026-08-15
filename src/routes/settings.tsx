import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Download, 
  Check, 
  Type, 
  HardDrive, 
  RefreshCw,
  Layers,
  Database
} from "lucide-react";

import { usePrefs } from "@/lib/prefs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const prefsContext = usePrefs() as any;
  const { prefs, updatePref, lang } = prefsContext || {};

  // লোকাল স্টেট হ্যান্ডলিং
  const [arabicSize, setArabicSize] = useState<number>(() => {
    if (prefs?.arabicFontSize) return Number(prefs.arabicFontSize);
    const saved = localStorage.getItem("quran_arabic_font_size");
    return saved ? Number(saved) : 28;
  });

  const [translationSize, setTranslationSize] = useState<number>(() => {
    if (prefs?.translationFontSize) return Number(prefs.translationFontSize);
    const saved = localStorage.getItem("quran_translation_font_size");
    return saved ? Number(saved) : 15;
  });

  const [downloadingSurahs, setDownloadingSurahs] = useState(false);
  const [downloadingAyahs, setDownloadingAyahs] = useState(false);
  const [surahProgress, setSurahProgress] = useState<number | null>(null);
  const [ayahProgress, setAyahProgress] = useState<number | null>(null);

  // ফন্ট সাইজ চেঞ্জ হ্যান্ডলার
  const handleArabicFontChange = (val: number[]) => {
    const size = val[0];
    setArabicSize(size);
    localStorage.setItem("quran_arabic_font_size", String(size));
    if (updatePref) updatePref("arabicFontSize", size);
  };

  const handleTranslationFontChange = (val: number[]) => {
    const size = val[0];
    setTranslationSize(size);
    localStorage.setItem("quran_translation_font_size", String(size));
    if (updatePref) updatePref("translationFontSize", size);
  };

  // ১১৪টি সুরা ডাউনলোড
  const handleDownloadAllSurahs = async () => {
    setDownloadingSurahs(true);
    setSurahProgress(0);
    try {
      for (let i = 1; i <= 114; i++) {
        await fetch(`/data/quran/surahs/${i}.json`);
        setSurahProgress(Math.round((i / 114) * 100));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingSurahs(false);
      setTimeout(() => setSurahProgress(null), 3000);
    }
  };

  // ৬২৩৬টি আয়াত ডাউনলোড
  const handleDownloadAllAyahs = async () => {
    setDownloadingAyahs(true);
    setAyahProgress(0);
    try {
      for (let i = 1; i <= 114; i++) {
        await fetch(`/data/quran/surahs/${i}.json`);
        setAyahProgress(Math.round((i / 114) * 100));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingAyahs(false);
      setTimeout(() => setAyahProgress(null), 3000);
    }
  };

  const displayLayers = [
    {
      key: "showArabic",
      title: lang === "bn" ? "আরবি টেক্সট" : "Arabic Text",
      desc: lang === "bn" ? "মূল কুরআন পাঠ প্রদর্শন" : "Display original Quranic text",
    },
    {
      key: "showWordByWord",
      title: lang === "bn" ? "শব্দে শব্দে অর্থ" : "Word by Word Meaning",
      desc: lang === "bn" ? "প্রতিটি শব্দের নিচে স্বতন্ত্র অর্থ ও উচ্চারণ" : "Meaning & transliteration under each word",
    },
    {
      key: "showTransliteration",
      title: lang === "bn" ? "উচ্চারণ (Transliteration)" : "Ayah Transliteration",
      desc: lang === "bn" ? "সহজে পড়ার জন্য আয়াতের উচ্চারণ নির্দেশিকা" : "Full ayah phonetic reading guide",
    },
    {
      key: "showConventionalBn",
      title: lang === "bn" ? "১. প্রচলিত অনুবাদ" : "1. Conventional Translation (BN)",
      desc: lang === "bn" ? "মুহিউদ্দীন খান / তাইসিরুল কুরআন (Greentech)" : "Standard Bengali translation",
    },
    {
      key: "showConventionalEn",
      title: lang === "bn" ? "২. Conventional Translation" : "2. Conventional Translation (EN)",
      desc: lang === "bn" ? "সহীহ ইন্টারন্যাশনাল স্ট্যান্ডার্ড অনুবাদ (Greentech)" : "Sahih International translation",
    },
    {
      key: "showModernBn",
      title: lang === "bn" ? "৩. আধুনিক অনুবাদ" : "3. Modern Translation (BN)",
      desc: lang === "bn" ? "আমাদের প্রাঞ্জল ও সহজবোধ্য আধুনিক বাংলা অনুবাদ" : "Contemporary contextual Bengali translation",
    },
    {
      key: "showModernEn",
      title: lang === "bn" ? "৪. Modern Translation" : "4. Modern Translation (EN)",
      desc: lang === "bn" ? "আমাদের সমসাময়িক আধুনিক ইংরেজি অনুবাদ" : "Contemporary contextual English translation",
    },
    {
      key: "showLexicon",
      title: lang === "bn" ? "অভিধান / Lexicon" : "Lexicon / Vocabulary",
      desc: lang === "bn" ? "শব্দকোষ, মূল ধাতু (Root) ও ব্যাকরণগত বিশ্লেষণ" : "Vocabulary, Arabic roots and grammatical notes",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 space-y-8">
      
      {/* হেডার */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="size-6 text-primary" />
            {lang === "bn" ? "সেটিংস ও পছন্দসমূহ" : "Settings & Preferences"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "bn"
              ? "অফলাইন ডাটা, ফন্ট সাইজ এবং ডিসপ্লে লেয়ার কাস্টমাইজ করুন"
              : "Manage offline data, font scaling and customize display layers"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="size-3" />
          {lang === "bn" ? "স্বয়ংক্রিয় সংরক্ষিত" : "Auto saved"}
        </span>
      </div>

      {/* ফন্ট সাইজ সেটিংস (সক্রিয় স্লাইডার) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Type className="size-4 text-primary" />
          <span>{lang === "bn" ? "ফন্ট সাইজ সেটিংস" : "Font Size Settings"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* আরবি ফন্ট সাইজ */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                {lang === "bn" ? "আরবি ফন্ট সাইজ" : "Arabic Font Size"}
              </Label>
              <span className="font-mono text-xs text-primary font-bold">{arabicSize}px</span>
            </div>
            
            <Slider
              value={[arabicSize]}
              min={20}
              max={52}
              step={1}
              onValueChange={handleArabicFontChange}
              className="py-1 cursor-pointer"
            />

            <div className="text-center pt-2 border-t border-border/40">
              <p className="arabic text-foreground font-normal leading-relaxed" style={{ fontSize: `${arabicSize}px` }}>
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          </div>

          {/* অনুবাদ ফন্ট সাইজ */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                {lang === "bn" ? "অনুবাদ ফন্ট সাইজ" : "Translation Font Size"}
              </Label>
              <span className="font-mono text-xs text-primary font-bold">{translationSize}px</span>
            </div>

            <Slider
              value={[translationSize]}
              min={12}
              max={28}
              step={1}
              onValueChange={handleTranslationFontChange}
              className="py-1 cursor-pointer"
            />

            <div className="text-center pt-3 border-t border-border/40">
              <p className="text-muted-foreground leading-relaxed" style={{ fontSize: `${translationSize}px` }}>
                পরম করুণাময় অতি দয়ালু আল্লাহর নামে
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* অফলাইন ডাউনলোড */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Database className="size-4 text-primary" />
          <span>{lang === "bn" ? "অফলাইন ডাউনলোড ম্যানেজমেন্ট" : "Offline Data Management"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* সুরা ডাউনলোড */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {lang === "bn" ? "১. সুরা ডাউনলোড (১১৪টি)" : "1. Download Surahs (114)"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "bn" ? "সম্পূর্ণ ১১৪টি সূরার লোকাল ডাটা ক্যাশ করুন" : "Cache all 114 surahs for full offline access"}
                </p>
              </div>
              <HardDrive className="size-5 text-muted-foreground" />
            </div>

            {surahProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>ডাউনলোড হচ্ছে...</span>
                  <span>{surahProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${surahProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={downloadingSurahs}
              onClick={handleDownloadAllSurahs}
              className="w-full text-xs h-8"
            >
              {downloadingSurahs ? (
                <>
                  <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                  ডাউনলোড হচ্ছে ({surahProgress}%)
                </>
              ) : (
                <>
                  <Download className="size-3.5 mr-1.5" />
                  ১১৪টি সুরা ডাউনলোড করুন
                </>
              )}
            </Button>
          </div>

          {/* আয়াত ডাউনলোড */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {lang === "bn" ? "২. আয়াত ডাউনলোড (৬২৩৬টি)" : "2. Download Ayahs (6236)"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "bn" ? "শব্দে শব্দে অর্থ ও রুটসহ অফলাইন ডাটা সেভ করুন" : "Save all ayahs with words and roots"}
                </p>
              </div>
              <Download className="size-5 text-muted-foreground" />
            </div>

            {ayahProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>সংরক্ষণ হচ্ছে...</span>
                  <span>{ayahProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${ayahProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={downloadingAyahs}
              onClick={handleDownloadAllAyahs}
              className="w-full text-xs h-8"
            >
              {downloadingAyahs ? (
                <>
                  <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                  সংরক্ষণ হচ্ছে ({ayahProgress}%)
                </>
              ) : (
                <>
                  <Download className="size-3.5 mr-1.5" />
                  ৬২৩৬টি আয়াত অফলাইন সেভ করুন
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ডিসপ্লে লেয়ার সেটিংস */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Layers className="size-4 text-primary" />
          <span>{lang === "bn" ? "প্রদর্শন সেটিংস (Display Layers)" : "Display Layers"}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayLayers.map((layer) => {
            const isChecked = prefs ? prefs[layer.key] !== false : true;

            return (
              <div
                key={layer.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-border"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={layer.key} className="text-sm font-semibold text-foreground cursor-pointer">
                    {layer.title}
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {layer.desc}
                  </p>
                </div>

                <Switch
                  id={layer.key}
                  checked={isChecked}
                  onCheckedChange={(val) => {
                    if (updatePref) updatePref(layer.key, val);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}