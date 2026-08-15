import { createFileRoute } from "@tanstack/react-router";

/** Streams the mirrored recitation from our own storage — no quran.com calls. */
export const Route = createFileRoute("/api/public/recitation/$surah/$ayah")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const surah = Number(params.surah);
        const ayah = Number((params.ayah ?? "").replace(/\.mp3$/, ""));
        if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const path = `${String(surah).padStart(3, "0")}/${String(ayah).padStart(3, "0")}.mp3`;
        const { data, error } = await supabaseAdmin.storage.from("recitation").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": "audio/mpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
