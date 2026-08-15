import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { usePrefs } from "@/lib/prefs";
import { useMenuItems } from "@/lib/menu";
import { supabase } from "@/integrations/supabase/client";
import { SocialLinks } from "@/components/SocialLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinkClass =
  "w-fit rounded-md border border-transparent px-3 py-1.5 text-chrome-foreground/70 transition-all duration-200 hover:bg-white/10 hover:text-chrome-foreground hover:translate-x-1";

const emailSchema = z.string().trim().email("সঠিক ইমেইল এড্রেস লিখুন");

export function SiteFooter() {
  const { t, lang } = usePrefs();
  const menu = useMenuItems("footer");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(lang === "en" ? "Please enter a valid email address" : "সঠিক ইমেইল এড্রেস দিন");
      return;
    }

    setLoading(true);
    try {
      // ১. ডাটাবেজের newsletter_subscribers টেবিলে সেভ
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: parsed.data });

      if (error) {
        if (error.code === "23505") {
          toast.info(
            lang === "en"
              ? "You are already subscribed!"
              : "আপনি ইতিমধ্যে সাবস্ক্রাইব করেছেন!"
          );
          setSubscribed(true);
          return;
        }
        throw error;
      }

      // ২. নোটিফিকেশন API কল করার চেষ্টা (যদি ব্যাকএন্ডে কনফিগার থাকে)
      try {
        await fetch("/api/public/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: parsed.data,
            target_notification: "newslater+notabene.inc@gmail.com",
          }),
        });
      } catch (apiErr) {
        // API কল ব্যাকগ্রাউন্ডে হ্যান্ডেল হবে
      }

      setSubscribed(true);
      setEmail("");
      toast.success(
        lang === "en"
          ? "Thank you for subscribing to our newsletter!"
          : "নিউজলেটারে সাবস্ক্রাইব করার জন্য ধন্যবাদ!"
      );
    } catch (err: any) {
      toast.error(err.message || "সাবস্ক্রিপশন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-white/10 bg-chrome text-chrome-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        {/* ১. পরিচিতি ও সোশ্যাল */}
        <div>
          <p className="font-display text-lg font-semibold tracking-tight">{t("siteName")}</p>
          <p className="mt-2 text-sm leading-relaxed text-chrome-foreground/70">{t("tagline")}</p>
          <SocialLinks className="mt-5" />
        </div>

        {/* ২. গুরুত্বপূর্ণ লিংকসমূহ */}
        <nav className="flex flex-col gap-1 text-sm">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-chrome-foreground/40">
            {lang === "en" ? "Navigation" : "মেনু লিংক"}
          </p>
          <Link to="/" className={footerLinkClass}>
            {t("home")}
          </Link>
          <Link to="/surah/$id" params={{ id: "1" }} className={footerLinkClass}>
            {t("readQuran")}
          </Link>
          <Link to="/articles" className={footerLinkClass}>
            {t("articles")}
          </Link>
          {menu.data?.map((m) => (
            <a key={m.id} href={m.href} className={footerLinkClass}>
              {lang === "en" && m.label_en ? m.label_en : m.label_bn}
            </a>
          ))}
          <Link to="/contact" className={footerLinkClass}>
            {t("contact")}
          </Link>
        </nav>

        {/* ৩. নিউজলেটার সাবস্ক্রিপশন ও কপিরাইট */}
        <div className="space-y-4 text-sm text-chrome-foreground/80">
          <div>
            <p className="font-semibold text-chrome-foreground">
              {lang === "en" ? "Subscribe to Newsletter" : "নিউজলেটার সাবস্ক্রাইব করুন"}
            </p>
            <p className="mt-1 text-xs text-chrome-foreground/60">
              {lang === "en"
                ? "Get updates on new articles and scientific Quran translations."
                : "নতুন আর্টিকেল এবং বিজ্ঞানভিত্তিক অনুবাদের আপডেট সরাসরি ইমেইলে পান।"}
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 rounded-xl bg-primary/20 border border-primary/30 p-3 text-xs text-primary">
              <CheckCircle2 className="size-4" />
              <span>{lang === "en" ? "Subscribed successfully!" : "সফলভাবে সাবস্ক্রাইব করা হয়েছে!"}</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder={lang === "en" ? "Your email address..." : "আপনার ইমেইল অ্যাড্রেস..."}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 rounded-xl border-white/20 bg-white/5 text-chrome-foreground placeholder:text-chrome-foreground/40 focus-visible:ring-primary text-xs"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl px-4 text-xs shrink-0"
              >
                {loading ? "..." : <Send className="size-3.5" />}
              </Button>
            </form>
          )}

          <div className="pt-2 text-xs text-chrome-foreground/50 border-t border-white/10">
            <p>© {new Date().getFullYear()} {t("siteName")} — সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </div>
    </footer>
  );
}