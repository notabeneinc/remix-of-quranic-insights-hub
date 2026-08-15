import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type MenuLocation = "header" | "footer";

export function useMenuItems(location: MenuLocation) {
  return useQuery({
    queryKey: ["menu-items", location],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, label_bn, label_en, href, sort_order")
        .eq("location", location)
        .eq("visible", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name_bn, name_en, show_in_menu, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}
