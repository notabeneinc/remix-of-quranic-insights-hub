import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sendLovableEmail } from "@lovable.dev/email-js";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(1).max(4000),
  token: z.string().trim().max(3000).optional().default(""),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "invalid_input" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: settings } = await supabaseAdmin
          .from("site_settings")
          .select("key, value")
          .in("key", ["turnstile", "turnstile_secret", "contact"]);

        const get = (key: string) =>
          (settings?.find((s) => s.key === key)?.value ?? {}) as Record<string, unknown>;
        const turnstile = get("turnstile");
        const secret = String(get("turnstile_secret")["secret_key"] ?? "");
        const contact = get("contact");

        if (turnstile["enabled"] && secret) {
          if (!parsed.token) {
            return Response.json({ error: "captcha_required" }, { status: 400 });
          }
          const form = new URLSearchParams({ secret, response: parsed.token });
          const ip = request.headers.get("cf-connecting-ip");
          if (ip) form.set("remoteip", ip);
          const verify = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            { method: "POST", body: form },
          );
          const result = (await verify.json()) as { success?: boolean };
          if (!result.success) {
            return Response.json({ error: "captcha_failed" }, { status: 400 });
          }
        }

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("contact_messages")
          .insert({
            name: parsed.name,
            email: parsed.email,
            subject: parsed.subject || null,
            message: parsed.message,
          })
          .select("id")
          .single();

        if (insertError) {
          return Response.json({ error: "store_failed" }, { status: 500 });
        }

        const to = String(contact["to_email"] ?? "info@wooniche.com");
        const from = String(contact["from_email"] ?? "");
        const apiKey = process.env["LOVABLE_API_KEY"];
        let emailSent = false;

        if (apiKey && from) {
          const senderDomain =
            String(contact["sender_domain"] ?? "") || (from.split("@").pop() ?? "");
          const subject = parsed.subject
            ? `[Contact] ${parsed.subject}`
            : `[Contact] New message from ${parsed.name}`;
          const text = `Name: ${parsed.name}\nEmail: ${parsed.email}\nSubject: ${
            parsed.subject || "-"
          }\n\n${parsed.message}`;
          try {
            const res = await sendLovableEmail(
              {
                to,
                from,
                sender_domain: senderDomain,
                reply_to: parsed.email,
                subject,
                text,
                html: `<h2>New contact message</h2><p><strong>Name:</strong> ${escapeHtml(
                  parsed.name,
                )}</p><p><strong>Email:</strong> ${escapeHtml(
                  parsed.email,
                )}</p><p><strong>Subject:</strong> ${escapeHtml(
                  parsed.subject || "-",
                )}</p><hr /><p>${escapeHtml(parsed.message).replace(/\n/g, "<br />")}</p>`,
                idempotency_key: inserted.id,
                label: "contact-form",
              },
              { apiKey },
            );
            emailSent = Boolean(res.success);
          } catch (e) {
            console.error("contact email failed", e);
          }
          if (emailSent) {
            await supabaseAdmin
              .from("contact_messages")
              .update({ email_sent: true })
              .eq("id", inserted.id);
          }
        }

        return Response.json({ ok: true, emailSent });
      },
    },
  },
});
