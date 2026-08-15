import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ShieldCheck, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { usePrefs } from "@/lib/prefs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const schema = z.object({
  site_key: z.string().trim().max(200),
  secret_key: z.string().trim().max(300),
  to_email: z.string().trim().email().max(255),
  newsletter_email: z.string().trim().email().max(255),
  from_email: z.string().trim().max(255),
  sender_domain: z.string().trim().max(255),
});

export function TurnstileAdmin() {
  const { t } = usePrefs();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [form, setForm] = useState({
    site_key: "",
    secret_key: "",
    to_email: "contact+notabene.inc@gmail.com",
    newsletter_email: "newslater+notabene.inc@gmail.com",
    from_email: "",
    sender_domain: "",
  });

  const settings = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!settings.data) return;
    const get = (key: string) =>
      (settings.data.find((s) => s.key === key)?.value ?? {}) as Record<string, unknown>;
    const ts = get("turnstile");
    const sec = get("turnstile_secret");
    const contact = get("contact");
    const newsletter = get("newsletter_settings");

    setEnabled(Boolean(ts["enabled"]));
    setForm({
      site_key: String(ts["site_key"] ?? ""),
      secret_key: String(sec["secret_key"] ?? ""),
      to_email: String(contact["to_email"] ?? "contact+notabene.inc@gmail.com"),
      newsletter_email: String(newsletter["to_email"] ?? "newslater+notabene.inc@gmail.com"),
      from_email: String(contact["from_email"] ?? ""),
      sender_domain: String(contact["sender_domain"] ?? ""),
    });
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const rows = [
        {
          key: "turnstile",
          value: { site_key: parsed.data.site_key, enabled },
          is_public: true,
        },
        {
          key: "turnstile_secret",
          value: { secret_key: parsed.data.secret_key },
          is_public: false,
        },
        {
          key: "contact",
          value: {
            to_email: parsed.data.to_email,
            from_email: parsed.data.from_email,
            sender_domain: parsed.data.sender_domain,
          },
          is_public: false,
        },
        {
          key: "newsletter_settings",
          value: {
            to_email: parsed.data.newsletter_email,
          },
          is_public: false,
        },
      ];
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["turnstile-config"] });
      toast.success(t("saved"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      className="card-soft space-y-5 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="font-semibold">{t("turnstileTab")} ও ইমেইল নোটিফিকেশন</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{enabled ? t("on") : t("off")}</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t("turnstileHint")}</p>

      {/* Turnstile Keys */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ts-site">{t("turnstileSiteKey")}</Label>
          <Input
            id="ts-site"
            value={form.site_key}
            onChange={(e) => setForm({ ...form, site_key: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ts-secret">{t("turnstileSecretKey")}</Label>
          <Input
            id="ts-secret"
            type="password"
            value={form.secret_key}
            onChange={(e) => setForm({ ...form, secret_key: e.target.value })}
          />
        </div>
      </div>

      {/* Target Notification Emails */}
      <div className="grid gap-4 sm:grid-cols-2 border-t border-border/50 pt-4">
        <div className="space-y-2">
          <Label htmlFor="ts-contact" className="flex items-center gap-1.5 font-medium">
            <Mail className="size-4 text-primary" /> কন্টাক্ট ফর্ম রিসিভ ইমেইল
          </Label>
          <Input
            id="ts-contact"
            type="email"
            value={form.to_email}
            onChange={(e) => setForm({ ...form, to_email: e.target.value })}
            placeholder="contact+notabene.inc@gmail.com"
          />
          <p className="text-[11px] text-muted-foreground">যোগাযোগ ফর্মের মেসেজগুলো এই ঠিকানায় যাবে</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ts-news" className="flex items-center gap-1.5 font-medium">
            <Send className="size-4 text-primary" /> নিউজলেটার রিসিভ ইমেইল
          </Label>
          <Input
            id="ts-news"
            type="email"
            value={form.newsletter_email}
            onChange={(e) => setForm({ ...form, newsletter_email: e.target.value })}
            placeholder="newslater+notabene.inc@gmail.com"
          />
          <p className="text-[11px] text-muted-foreground">নতুন সাবস্ক্রাইবার হলে এই ঠিকানায় নোটিফিকেশন যাবে</p>
        </div>
      </div>

      {/* Sender Configuration */}
      <div className="grid gap-4 sm:grid-cols-2 border-t border-border/50 pt-4">
        <div className="space-y-2">
          <Label htmlFor="ts-from">{t("contactFromEmail")}</Label>
          <Input
            id="ts-from"
            placeholder="noreply@notify.wooniche.com"
            value={form.from_email}
            onChange={(e) => setForm({ ...form, from_email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ts-domain">{t("contactSenderDomain")}</Label>
          <Input
            id="ts-domain"
            placeholder="notify.wooniche.com"
            value={form.sender_domain}
            onChange={(e) => setForm({ ...form, sender_domain: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" disabled={save.isPending}>
        {t("save")}
      </Button>
    </form>
  );
}