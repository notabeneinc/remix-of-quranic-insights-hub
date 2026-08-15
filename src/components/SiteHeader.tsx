import { Link } from "@tanstack/react-router";
import { BookOpen, Bookmark, Languages, LogIn, LogOut, Moon, Shield, Sun, Menu } from "lucide-react";
import { useState } from "react";

import { usePrefs } from "@/lib/prefs";
import { useIsAdmin, useSession } from "@/lib/auth";
import { useMenuItems } from "@/lib/menu";
import { supabase } from "@/integrations/supabase/client";
import { SocialLinks } from "@/components/SocialLinks";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const navButtonClass =
  "rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-chrome-foreground/75 transition-all duration-200 hover:bg-white/10 hover:text-chrome-foreground hover:shadow-sm hover:scale-[1.02]";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t, lang } = usePrefs();
  const menu = useMenuItems("header");

  return (
    <>
      <Link
        to="/"
        onClick={onNavigate}
        activeOptions={{ exact: true }}
        activeProps={{ className: "bg-white/10 text-chrome-foreground" }}
        className={navButtonClass}
      >
        {t("home")}
      </Link>
      <Link
        to="/surah/$id"
        params={{ id: "1" }}
        onClick={onNavigate}
        activeProps={{ className: "bg-white/10 text-chrome-foreground" }}
        className={navButtonClass}
      >
        {t("readQuran")}
      </Link>
      <Link
        to="/articles"
        onClick={onNavigate}
        activeProps={{ className: "bg-white/10 text-chrome-foreground" }}
        className={navButtonClass}
      >
        {t("articles")}
      </Link>
      {menu.data?.map((m) => (
        <a key={m.id} href={m.href} onClick={onNavigate} className={navButtonClass}>
          {lang === "en" && m.label_en ? m.label_en : m.label_bn}
        </a>
      ))}
      <Link
        to="/contact"
        onClick={onNavigate}
        activeProps={{ className: "bg-white/10 text-chrome-foreground" }}
        className={navButtonClass}
      >
        {t("contact")}
      </Link>
    </>
  );
}

export function SiteHeader() {
  const { t, lang, toggleLang, dark, setDark } = usePrefs();
  const { user } = useSession();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-chrome text-chrome-foreground">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex size-9 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-100 shadow-sm transition-colors group-hover:bg-slate-700">
            <BookOpen className="size-5 text-slate-200" />
          </span>
          <span 
            className="text-xl sm:text-2xl font-normal text-slate-100 tracking-wide transition-colors group-hover:text-white"
            style={{ fontFamily: "'Kaushan Script', cursive" }}
          >
            Quran Explorer
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-3 md:flex">
          <NavLinks />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SocialLinks className="hidden lg:flex" />

          <button
            onClick={toggleLang}
            className="flex size-9 items-center justify-center rounded-md border border-white/15 text-chrome-foreground/80 transition-colors hover:bg-white/10 hover:text-chrome-foreground"
            aria-label={t("language")}
            title={lang === "bn" ? "বাংলা → English" : "English → বাংলা"}
          >
            <Languages className="size-4" />
          </button>

          <div className="flex items-center gap-1.5 rounded-md border border-white/15 px-2 py-1">
            <Sun className="size-3.5 text-chrome-foreground/60" />
            <Switch checked={dark} onCheckedChange={setDark} aria-label={t("darkMode")} />
            <Moon className="size-3.5 text-chrome-foreground/60" />
          </div>

          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-chrome-foreground/80 hover:bg-white/10 hover:text-chrome-foreground"
                aria-label={t("bookmarks")}
                title={t("bookmarks")}
              >
                <Link to="/bookmarks">
                  <Bookmark className="size-4" />
                </Link>
              </Button>
              {isAdmin && (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="text-chrome-foreground/80 hover:bg-white/10 hover:text-chrome-foreground"
                  aria-label={t("admin")}
                  title={t("admin")}
                >
                  <Link to="/admin">
                    <Shield className="size-4" />
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="border-white/20 bg-transparent text-chrome-foreground/80 hover:bg-white/10 hover:text-chrome-foreground"
                aria-label={t("signOut")}
                title={t("signOut")}
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <Button asChild size="icon" className="hidden sm:inline-flex" aria-label={t("signIn")} title={t("signIn")}>
              <Link to="/auth">
                <LogIn className="size-4" />
              </Link>
            </Button>
          )}

          <button
            className="md:hidden rounded-md border border-white/15 p-1.5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-chrome px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLinks onNavigate={() => setOpen(false)} />
            {user ? (
              <>
                <Link to="/bookmarks" onClick={() => setOpen(false)} className="text-sm font-medium">
                  {t("bookmarks")}
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-sm font-medium">
                    {t("admin")}
                  </Link>
                )}
                <button
                  className="text-left text-sm font-medium text-destructive"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="text-sm font-medium text-primary">
                {t("signIn")}
              </Link>
            )}
            <SocialLinks className="pt-2" />
          </div>
        </div>
      )}
    </header>
  );
}