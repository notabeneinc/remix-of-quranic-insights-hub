import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, User } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { usePrefs } from "@/lib/prefs";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/articles/$slug")({
  head: ({ loaderData }) => {
    const article = loaderData;
    const title = article ? `${article.title_bn} — কুরআন অন্বেষা` : "আর্টিকেল — কুরআন অন্বেষা";
    return {
      meta: [
        { title },
        { name: "description", content: article?.excerpt_bn ?? "ইসলাম ও বিজ্ঞান বিষয়ক প্রবন্ধ।" },
        { property: "og:title", content: title },
        { property: "og:description", content: article?.excerpt_bn ?? "" },
        ...(article?.cover_image_url
          ? [{ property: "og:image", content: article.cover_image_url }]
          : []),
      ],
    };
  },
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("articles")
      .select("*, author:authors(name_bn, name_en)")
      .eq("slug", params.slug)
      .eq("published", true)
      .single();
    return data;
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { lang, t } = usePrefs();
  const initial = Route.useLoaderData();

  const query = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, author:authors(name_bn, name_en)")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data;
    },
    initialData: initial ?? undefined,
  });

  const article = query.data;

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/articles">
            <ChevronLeft className="size-4" /> {t("articles")}
          </Link>
        </Button>
      </div>
    );
  }

  const title = lang === "en" && article.title_en ? article.title_en : article.title_bn;
  const content = lang === "en" && article.content_en ? article.content_en : article.content_bn;
  const authorName =
    article.author &&
    (lang === "en" && article.author.name_en ? article.author.name_en : article.author.name_bn);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/articles">
          <ChevronLeft className="size-4" /> {t("articles")}
        </Link>
      </Button>

      {article.cover_image_url && (
        <img
          src={article.cover_image_url}
          alt={title}
          className="mb-8 h-64 w-full rounded-xl object-cover shadow-sm sm:h-80"
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
        <BookmarkButton
          target={{
            kind: "article",
            slug: article.slug,
            label: title,
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border pb-6">
        {article.published_at && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {new Date(article.published_at).toLocaleDateString(lang === "en" ? "en-US" : "bn-BD", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
        {authorName && (
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5" />
            {authorName}
          </span>
        )}
      </div>

      <div
        className="prose prose-neutral dark:prose-invert mt-8 max-w-none text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content ?? "" }}
      />
    </article>
  );
}