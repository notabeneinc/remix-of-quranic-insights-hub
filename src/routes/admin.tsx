import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  UserCheck,
  Shield,
  UserX,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  LayoutGrid,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useSession } from "@/lib/auth";
import { usePrefs } from "@/lib/prefs";
import { useCategories } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { OfflineSyncAdmin } from "@/components/OfflineSyncAdmin";
import { AuthorsAdmin } from "@/components/AuthorsAdmin";
import { CategoriesAdmin } from "@/components/CategoriesAdmin";
import { MenuAdmin } from "@/components/MenuAdmin";
import { PagesAdmin } from "@/components/PagesAdmin";
import { SocialLinksAdmin } from "@/components/SocialLinksAdmin";
import { TurnstileAdmin } from "@/components/TurnstileAdmin";
import { MessagesAdmin } from "@/components/MessagesAdmin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন ড্যাশবোর্ড — কুরআন অন্বেষা" },
      { name: "description", content: "আর্টিকেল ও বিজ্ঞানভিত্তিক অনুবাদ ইনপুট দেওয়ার প্যানেল।" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "অ্যাডমিন ড্যাশবোর্ড — কুরআন অন্বেষা" },
      { property: "og:description", content: "কনটেন্ট ব্যবস্থাপনা প্যানেল।" },
    ],
  }),
  component: AdminPage,
});

/* ========================================================================== */
/* RICH TEXT EDITOR COMPONENT (WITH MARKDOWN PASTE SUPPORT)                  */
/* ========================================================================== */
function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        transformPastedText: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-md border border-input bg-background">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="size-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="size-4" />
        </Button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] focus:outline-none [&_.tiptap]:focus:outline-none"
        />
      </div>
    </div>
  );
}

function AdminPage() {
  const { t } = usePrefs();
  const { user, loading } = useSession();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState("articles");

  const tabOptions = [
    { value: "articles", label: t("articles") },
    { value: "translations", label: t("translationsTab") },
    { value: "posts", label: t("postSettings") },
    { value: "categories", label: t("categoriesTab") },
    { value: "roles", label: "অ্যাডমিন বা ইউজার রোল" },
    { value: "menu", label: t("menuTab") },
    { value: "pages", label: t("pagesTab") },
    { value: "social", label: t("socialTab") },
    { value: "turnstile", label: t("turnstileTab") },
    { value: "messages", label: t("messagesTab") },
    { value: "offline", label: t("offlineTab") },
    { value: "subs", label: t("subscribersTab") },
  ];

  if (loading || (user && roleLoading)) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">{t("adminOnly")}</p>
        <Button asChild className="mt-4">
          <Link to="/auth">{t("signIn")}</Link>
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">{t("adminOnly")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("dashboard")}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            কন্টেন্ট, সেটিংস ও ওয়েবসাইট ব্যবস্থাপনা প্যানেল
          </p>
        </div>

        {/* সার্বজনীন ড্রপডাউন মেনু */}
        <div className="w-full sm:w-72">
          <div className="relative">
            <LayoutGrid className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary pointer-events-none" />
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full h-11 appearance-none rounded-xl border border-border/80 bg-card pl-10 pr-9 text-sm font-semibold shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {tabOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-background text-foreground py-2">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
              ▼
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsContent value="articles" className="mt-0">
          <ArticlesAdmin />
        </TabsContent>
        <TabsContent value="translations" className="mt-0">
          <TranslationsAdmin />
        </TabsContent>
        <TabsContent value="posts" className="mt-0">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("authorsTab")}</p>
            <AuthorsAdmin />
          </div>
        </TabsContent>
        <TabsContent value="categories" className="mt-0">
          <CategoriesAdmin />
        </TabsContent>
        <TabsContent value="roles" className="mt-0">
          <RolesAdmin />
        </TabsContent>
        <TabsContent value="menu" className="mt-0">
          <MenuAdmin />
        </TabsContent>
        <TabsContent value="pages" className="mt-0">
          <PagesAdmin />
        </TabsContent>
        <TabsContent value="social" className="mt-0">
          <SocialLinksAdmin />
        </TabsContent>
        <TabsContent value="turnstile" className="mt-0">
          <TurnstileAdmin />
        </TabsContent>
        <TabsContent value="messages" className="mt-0">
          <MessagesAdmin />
        </TabsContent>
        <TabsContent value="offline" className="mt-0">
          <OfflineSyncAdmin />
        </TabsContent>
        <TabsContent value="subs" className="mt-0">
          <SubscribersAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RolesAdmin() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"admin" | "user">("admin");

  const rolesList = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addRole = useMutation({
    mutationFn: async () => {
      if (!userId.trim()) throw new Error("User ID প্রদান করুন");
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId.trim(), role }, { onConflict: "user_id,role" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      setUserId("");
      toast.success("ইউজার রোল সফলভাবে আপডেট হয়েছে!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("রোল রিমুভ করা হয়েছে");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <form
        className="card-soft space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          addRole.mutate();
        }}
      >
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Shield className="size-5 text-primary" /> নতুন এডমিন বা রোল যুক্ত করুন
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="userId">User ID (Supabase Auth UID)</Label>
            <Input
              id="userId"
              placeholder="যেমন: e2a8b... (User UUID)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              💡 আপনি সাবস্ক্রাইবার তালিকা থেকে সরাসরি UUID কপি করে এখানে পেস্ট করতে পারেন।
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleSelect">রোল সিলেক্ট করুন</Label>
            <select
              id="roleSelect"
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "user")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={addRole.isPending}>
          <UserCheck className="size-4 mr-2" /> রোল অ্যাসাইন করুন
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground">বর্তমান রোলগুলোর তালিকা:</h3>
        {rolesList.data?.map((r) => (
          <div key={r.id} className="card-soft flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium font-mono">{r.user_id}</p>
              <span className="inline-block mt-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                {r.role}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete Role"
              onClick={() => removeRole.mutate(r.id)}
            >
              <UserX className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

const articleSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug: lowercase letters, numbers and dashes only"),
  title_bn: z.string().trim().min(1).max(200),
  title_en: z.string().trim().max(200),
  excerpt_bn: z.string().trim().max(500),
  excerpt_en: z.string().trim().max(500),
  content_bn: z.string().trim().max(60000),
  content_en: z.string().trim().max(60000),
  cover_image_url: z.string().trim().max(500),
});

const EMPTY = {
  slug: "",
  title_bn: "",
  title_en: "",
  excerpt_bn: "",
  excerpt_en: "",
  content_bn: "",
  content_en: "",
  cover_image_url: "",
};

function ArticlesAdmin() {
  const { t } = usePrefs();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...EMPTY });
  const [published, setPublished] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const categories = useCategories();

  const authors = useQuery({
    queryKey: ["authors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("authors").select("id, name_bn").order("name_bn");
      if (error) throw error;
      return data;
    },
  });

  const list = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = articleSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const payload = {
        ...parsed.data,
        title_en: parsed.data.title_en || null,
        excerpt_bn: parsed.data.excerpt_bn || null,
        excerpt_en: parsed.data.excerpt_en || null,
        content_bn: parsed.data.content_bn || null,
        content_en: parsed.data.content_en || null,
        cover_image_url: parsed.data.cover_image_url || null,
        published,
        author_id: authorId || null,
        category_id: categoryId || null,
        published_at: published ? new Date().toISOString() : null,
        created_by: user!.id,
      };
      if (editingId) {
        const { error } = await supabase.from("articles").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setForm({ ...EMPTY });
      setEditingId(null);
      setAuthorId("");
      toast.success(t("saved"));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(t("delete"));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const field = (key: keyof typeof EMPTY, label: string, long = false) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      {long ? (
        key.startsWith("content") ? (
          <RichTextEditor
            value={form[key]}
            onChange={(val) => setForm({ ...form, [key]: val })}
          />
        ) : (
          <Textarea
            id={key}
            rows={3}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        )
      ) : (
        <Input
          id={key}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <form
        className="card-soft space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{editingId ? t("edit") : t("newArticle")}</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{published ? t("published") : t("draft")}</span>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
        </div>
        {field("slug", t("slug"))}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("title_bn", t("titleBn"))}
          {field("title_en", t("titleEn"))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("excerpt_bn", t("excerptBn"), true)}
          {field("excerpt_en", t("excerptEn"), true)}
        </div>
        {field("content_bn", t("contentBn"), true)}
        {field("content_en", t("contentEn"), true)}
        {field("cover_image_url", t("coverImage"))}
        <div className="space-y-2">
          <Label htmlFor="author">{t("author")}</Label>
          <select
            id="author"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("noAuthor")}</option>
            {authors.data?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name_bn}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="article-category">{t("category")}</Label>
          <select
            id="article-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("noCategory")}</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_bn}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending}>
            <Plus className="size-4" /> {t("save")}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm({ ...EMPTY });
              }}
            >
              {t("cancel")}
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {list.data?.map((a) => (
          <div key={a.id} className="card-soft flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{a.title_bn}</p>
              <p className="text-xs text-muted-foreground">
                /{a.slug} · {a.published ? t("published") : t("draft")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("edit")}
              onClick={() => {
                setEditingId(a.id);
                setPublished(a.published);
                setAuthorId(a.author_id ?? "");
                setCategoryId(a.category_id ?? "");
                setForm({
                  slug: a.slug,
                  title_bn: a.title_bn,
                  title_en: a.title_en ?? "",
                  excerpt_bn: a.excerpt_bn ?? "",
                  excerpt_en: a.excerpt_en ?? "",
                  content_bn: a.content_bn ?? "",
                  content_en: a.content_en ?? "",
                  cover_image_url: a.cover_image_url ?? "",
                });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("delete")}
              onClick={() => remove.mutate(a.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

const transSchema = z.object({
  surah: z.coerce.number().int().min(1).max(114),
  ayah: z.coerce.number().int().min(1).max(300),
  lang: z.enum(["bn", "en", "bn_std", "en_std"]),
  text: z.string().trim().min(1).max(8000),
  note: z.string().trim().max(4000),
});

function TranslationsAdmin() {
  const { t } = usePrefs();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [surah, setSurah] = useState("1");
  const [ayah, setAyah] = useState("1");
  const [lng, setLng] = useState<"bn" | "en" | "bn_std" | "en_std">("bn");
  const [text, setText] = useState("");
  const [note, setNote] = useState("");

  const list = useQuery({
    queryKey: ["admin-verse-translations", surah],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verse_translations")
        .select("*")
        .eq("surah", Number(surah) || 1)
        .order("ayah");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = transSchema.safeParse({ surah, ayah, lang: lng, text, note });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const { error } = await supabase.from("verse_translations").upsert(
        {
          surah: parsed.data.surah,
          ayah: parsed.data.ayah,
          lang: parsed.data.lang,
          text: parsed.data.text,
          note: parsed.data.note || null,
          created_by: user!.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "surah,ayah,lang" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verse-translations"] });
      queryClient.invalidateQueries({ queryKey: ["verse-translations"] });
      setText("");
      setNote("");
      toast.success(t("saved"));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("verse_translations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verse-translations"] });
      queryClient.invalidateQueries({ queryKey: ["verse-translations"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-8">
      <form
        className="card-soft space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="surah">{t("surahNumber")}</Label>
            <Input
              id="surah"
              type="number"
              min={1}
              max={114}
              value={surah}
              onChange={(e) => setSurah(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ayah">{t("ayahNumber")}</Label>
            <Input
              id="ayah"
              type="number"
              min={1}
              max={300}
              value={ayah}
              onChange={(e) => setAyah(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">{t("translationType")}</Label>
            <select
              id="lng"
              value={lng}
              onChange={(e) => setLng(e.target.value as typeof lng)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="bn">{t("sciBn")}</option>
              <option value="en">{t("sciEn")}</option>
              <option value="bn_std">{t("stdBn")}</option>
              <option value="en_std">{t("stdEn")}</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="text">{t("translationText")}</Label>
          <Textarea id="text" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">{t("note")}</Label>
          <Textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button type="submit" disabled={save.isPending}>
          {t("save")}
        </Button>
      </form>

      <div className="space-y-3">
        {list.data?.map((v) => (
          <div key={v.id} className="card-soft flex items-start gap-3 p-4">
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
              {v.surah}:{v.ayah} · {v.lang}
            </span>
            <p className="min-w-0 flex-1 text-sm">{v.text}</p>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("delete")}
              onClick={() => remove.mutate(v.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscribersAdmin() {
  const { t } = usePrefs();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("UUID ক্লিপবোর্ডে কপি হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-semibold">নিউজলেটার সাবস্ক্রাইবার তালিকা</h2>
          <p className="text-xs text-muted-foreground">
            সাবস্ক্রাইবারের UUID দেখতে পাবেন এবং কপি করে এডমিন রোলে ব্যবহার করতে পারবেন।
          </p>
        </div>
      </div>

      <div className="card-soft divide-y divide-border">
        {list.data?.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">{t("noArticles")}</p>
        )}
        {list.data?.map((s) => (
          <div
            key={s.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm"
          >
            <div className="space-y-1">
              <span className="font-medium text-foreground">{s.email}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground bg-muted/70 px-2 py-0.5 rounded border border-border/50 select-all">
                  UUID: {s.id}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(s.id)}
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                >
                  {copiedId === s.id ? (
                    <>
                      <Check className="size-3 text-emerald-500" /> কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" /> কপি
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {new Date(s.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}