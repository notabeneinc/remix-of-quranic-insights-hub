import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { usePrefs } from "@/lib/prefs";
import { useCategories } from "@/lib/menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

type ArticlesSearch = { page?: number; category?: string };

export const Route = createFileRoute("/articles/")({
  validateSearch: (search: Record<string, unknown>): ArticlesSearch => {
    const parsed = Number(search['page']);
    const raw = search['category'];
    const category = typeof raw === "string" ? raw.slice(0, 80) : undefined;
    return {
      ...(Number.isFinite(parsed) && parsed > 1 ? { page: Math.floor(parsed) } : {}),
      ...(category ? { category } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "আর্টিকেল — কুরআন অন্বেষা" },
      {
        name: "description",
        content: "কুরআন, বিজ্ঞান ও চিন্তাভাবনা নিয়ে নিয়মিত বাংলা ও ইংরেজি আর্টিকেল।",
      },
      { property: "og:title", content: "আর্টিকেল — কুরআন অন্বেষা" },
      {
        property: "og:description",
        content: "কুরআন ও বিজ্ঞান নিয়ে বাংলা ও ইংরেজি লেখা।",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://quran-explore-pro.lovable.app/articles" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://quran-explore-pro.lovable.app/articles" }],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { t, lang } = usePrefs();
  const navigate = useNavigate({ from: Route.fullPath });
  const { page: pageParam, category } = Route.useSearch();
  const page = pageParam ?? 1;
  const isMobile = useIsMobile();
  const perPage = isMobile ? 6 : 9;
  const categories = useCategories();

  const categoryId = categories.data?.find((c) => c.slug === category)?.id ?? null;

  const articles = useQuery({
    queryKey: ["articles", "published", page, perPage, category ?? null, categoryId],
    queryFn: async () => {
      const from = (page - 1) * perPage;
      let query = supabase
        .from("articles")
        .select(
          "id, slug, title_bn, title_en, excerpt_bn, excerpt_en, published_at, cover_image_url",
          { count: "exact" },
        )
        .eq("published", true);
      if (category && categoryId) query = query.eq("category_id", categoryId);
      const { data, error, count } = await query
        .order("published_at", { ascending: false })
        .range(from, from + perPage - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const totalPages = Math.max(1, Math.ceil((articles.data?.count ?? 0) / perPage));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{t("articles")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("newsletterSub")}</p>

      {(categories.data?.length ?? 0) > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.data?.map((c) => (
            <Button
              key={c.id}
              variant={category === c.slug ? "default" : "outline"}
              size="sm"
              onClick={() => navigate({ search: { category: c.slug } })}
            >
              {lang === "en" && c.name_en ? c.name_en : c.name_bn}
            </Button>
          ))}
          <Button
            variant={category ? "outline" : "default"}
            size="sm"
            onClick={() => navigate({ search: {} })}
          >
            {t("allCategories")}
          </Button>
        </div>
      )}

      {articles.isLoading && <p className="mt-8 text-sm text-muted-foreground">{t("loading")}</p>}

      {articles.data && articles.data.rows.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">{t("noArticles")}</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.data?.rows.map((a) => (
          <Link
            key={a.id}
            to="/articles/$slug"
            params={{ slug: a.slug }}
            className="card-soft group flex h-full flex-col overflow-hidden border border-border/70 p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="aspect-[16/10] w-full overflow-hidden bg-accent/50">
              {a.cover_image_url ? (
                <img
                  src={a.cover_image_url}
                  alt={lang === "en" && a.title_en ? a.title_en : a.title_bn}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center font-display text-3xl text-primary/40">
                  ﷽
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col p-5">
              <h2 className="text-lg font-semibold transition-colors group-hover:text-primary">
                {lang === "en" && a.title_en ? a.title_en : a.title_bn}
              </h2>
              {a.published_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(a.published_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB")}
                </p>
              )}
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {lang === "en" && a.excerpt_en ? a.excerpt_en : a.excerpt_bn}
              </p>
              <span className="mt-4 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {t("readMore")} →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() =>
              navigate({ search: { page: page - 1, ...(category ? { category } : {}) } })
            }
          >
            ← {t("prev")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("page")} {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() =>
              navigate({ search: { page: page + 1, ...(category ? { category } : {}) } })
            }
          >
            {t("next")} →
          </Button>
        </nav>
      )}
    </div>
  );
}
