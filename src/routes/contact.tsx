import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { usePrefs } from "@/lib/prefs";
import { useTurnstileConfig } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — কুরআন অন্বেষা / Contact — Quran Explorer" },
      {
        name: "description",
        content:
          "কুরআন অন্বেষা সম্পর্কে প্রশ্ন, অনুবাদ সংশোধনের প্রস্তাব বা মতামত পাঠান — আমরা প্রতিটি বার্তার উত্তর দিই।",
      },
      { property: "og:title", content: "যোগাযোগ — কুরআন অন্বেষা" },
      {
        property: "og:description",
        content: "প্রশ্ন, পরামর্শ বা অনুবাদ সংশোধনের প্রস্তাব পাঠাতে যোগাযোগ করুন।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().max(200),
  message: z.string().trim().min(1, "Message is required").max(4000),
});

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

function TurnstileWidget({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    const id = "cf-turnstile-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      document.head.appendChild(s);
    }
    const timer = window.setInterval(() => {
      if (rendered.current || !window.turnstile || !ref.current) return;
      rendered.current = true;
      window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
      window.clearInterval(timer);
    }, 200);
    return () => window.clearInterval(timer);
  }, [siteKey, onToken]);

  return <div ref={ref} className="min-h-[70px]" />;
}

function ContactPage() {
  const { t, lang } = usePrefs();
  const turnstile = useTurnstileConfig();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [token, setToken] = useState("");
  const [sending, setSending] = useState(false);

  const captchaOn = Boolean(turnstile.data?.enabled && turnstile.data.site_key);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("error"));
      return;
    }
    if (captchaOn && !token) {
      toast.error(t("captchaRequired"));
      return;
    }
    setSending(true);
    try {
      // ১. প্রথমে API কল করার চেষ্টা
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, token }),
      });

      if (!res.ok) {
        // ২. API ফেইল হলে সরাসরি Supabase টেবিলে ব্যাকআপ ইনসার্ট
        const { error: dbError } = await supabase.from("contact_messages").insert({
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject || null,
          message: parsed.data.message,
        });
        if (dbError) throw new Error(t("contactFailed"));
      }

      toast.success(t("contactSent"));
      setForm({ name: "", email: "", subject: "", message: "" });
      setToken("");
      window.turnstile?.reset();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">{t("contact")}</h1>

      <div className="card-soft mt-6 space-y-3 p-6">
        <div className="flex items-center gap-2 text-primary">
          <Mail className="size-5" />
          <span className="text-sm font-semibold">{t("contactIntroTitle")}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("contactIntro")}</p>
        <SocialLinks className="pt-1 [&_a]:border-border [&_a]:text-muted-foreground [&_a:hover]:bg-primary/10 [&_a:hover]:text-primary" />
      </div>

      <form className="card-soft mt-6 space-y-4 p-6" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-name">{t("yourName")}</Label>
            <Input
              id="c-name"
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email">{t("email")}</Label>
            <Input
              id="c-email"
              type="email"
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-subject">{t("subject")}</Label>
          <Input
            id="c-subject"
            maxLength={200}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-message">{t("messageLabel")}</Label>
          <Textarea
            id="c-message"
            rows={6}
            maxLength={4000}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
        </div>

        {captchaOn && (
          <TurnstileWidget siteKey={turnstile.data!.site_key} onToken={setToken} />
        )}

        <Button type="submit" disabled={sending}>
          <Send className="size-4" /> {sending ? t("sending") : t("sendMessage")}
        </Button>
        <p className="text-xs text-muted-foreground">
          {lang === "en"
            ? "We usually reply within a few days."
            : "সাধারণত কয়েক দিনের মধ্যেই উত্তর দেওয়া হয়।"}
        </p>
      </form>
    </div>
  );
}