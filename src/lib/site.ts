import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social-links"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("id, platform, label, url, sort_order")
        .eq("visible", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export type TurnstileConfig = { site_key: string; enabled: boolean };

export function useTurnstileConfig() {
  return useQuery({
    queryKey: ["turnstile-config"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<TurnstileConfig> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "turnstile")
        .maybeSingle();
      if (error) throw error;
      const v = (data?.value ?? {}) as Partial<TurnstileConfig>;
      return { site_key: v.site_key ?? "", enabled: Boolean(v.enabled) };
    },
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
