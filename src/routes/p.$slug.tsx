import { createFileRoute } from "@tanstack/react-router";

import { usePrefs } from "@/lib/prefs";
import { usePage } from "@/lib/site";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({
    meta: [
      { title: "পাতা — কুরআন অন্বেষা / Page — Quran Explorer" },
      {
        name: "description",
        content: "কুরআন অন্বেষার তথ্যপাতা — সাইট সম্পর্কিত বিস্তারিত তথ্য ও নীতিমালা।",
      },
      { property: "og:title", content: "পাতা — কুরআন অন্বেষা" },
      { property: "og:description", content: "কুরআন অন্বেষার তথ্যপাতা।" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PageView,
});

function PageView() {
  const { slug } = Route.useParams();
  const { t, lang } = usePrefs();
  const page = usePage(slug);

  if (page.isLoading) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (!page.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          {lang === "en" ? "Page not found." : "পাতাটি পাওয়া যায়নি।"}
        </p>
      </div>
    );
  }

  const title = lang === "en" && page.data.title_en ? page.data.title_en : page.data.title_bn;
  const content =
    lang === "en" && page.data.content_en ? page.data.content_en : page.data.content_bn;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed">
        {(content ?? "")
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
      </div>
    </article>
  );
}
