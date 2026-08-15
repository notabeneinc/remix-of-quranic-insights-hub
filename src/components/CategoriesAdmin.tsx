import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { usePrefs } from "@/lib/prefs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "slug: lowercase letters, numbers and dashes only"),
  name_bn: z.string().trim().min(1).max(120),
  name_en: z.string().trim().max(120),
  sort_order: z.coerce.number().int().min(0).max(999),
});

const EMPTY = { slug: "", name_bn: "", name_en: "", sort_order: "0" };

export function CategoriesAdmin() {
  const { t } = usePrefs();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...EMPTY });
  const [showInMenu, setShowInMenu] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["menu-items"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const payload = {
        slug: parsed.data.slug,
        name_bn: parsed.data.name_bn,
        name_en: parsed.data.name_en || null,
        sort_order: parsed.data.sort_order,
        show_in_menu: showInMenu,
      };
      if (editingId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      setForm({ ...EMPTY });
      setEditingId(null);
      toast.success(t("saved"));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
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
        <h2 className="font-semibold">{editingId ? t("edit") : t("newCategory")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cat-name-bn">{t("categoryNameBn")}</Label>
            <Input
              id="cat-name-bn"
              value={form.name_bn}
              onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-name-en">{t("categoryNameEn")}</Label>
            <Input
              id="cat-name-en"
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-slug">{t("slug")}</Label>
            <Input
              id="cat-slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-order">{t("sortOrder")}</Label>
            <Input
              id="cat-order"
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Switch checked={showInMenu} onCheckedChange={setShowInMenu} id="cat-menu" />
          <Label htmlFor="cat-menu">{t("showInMenu")}</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending}>
            {t("save")}
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
        {list.data?.map((c) => (
          <div key={c.id} className="card-soft flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.name_bn}</p>
              <p className="text-xs text-muted-foreground">
                /{c.slug} · {c.show_in_menu ? t("showInMenu") : "—"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("edit")}
              onClick={() => {
                setEditingId(c.id);
                setShowInMenu(c.show_in_menu);
                setForm({
                  slug: c.slug,
                  name_bn: c.name_bn,
                  name_en: c.name_en ?? "",
                  sort_order: String(c.sort_order),
                });
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("delete")}
              onClick={() => remove.mutate(c.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
