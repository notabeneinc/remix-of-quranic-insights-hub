import { useEffect, useState } from "react";

export type BookmarkTarget =
  | { kind: "surah"; surah: number; label: string; slug?: never; ayah?: never }
  | { kind: "ayah"; surah: number; ayah: number; label: string; slug?: never }
  | { kind: "article"; slug: string; label: string; surah?: never; ayah?: never };

const KEY = "quran_anwesha_bookmarks_v1";

export function getBookmarks(): BookmarkTarget[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(target: BookmarkTarget): boolean {
  const all = getBookmarks();
  return all.some((b) => {
    if (b.kind === "article" && target.kind === "article") {
      return b.slug === target.slug;
    }
    if (b.kind === "surah" && target.kind === "surah") {
      return b.surah === target.surah;
    }
    if (b.kind === "ayah" && target.kind === "ayah") {
      return b.surah === target.surah && b.ayah === target.ayah;
    }
    return false;
  });
}

export function toggleBookmark(target: BookmarkTarget): boolean {
  const all = getBookmarks();
  const exists = isBookmarked(target);
  let updated: BookmarkTarget[];

  if (exists) {
    updated = all.filter((b) => {
      if (b.kind === "article" && target.kind === "article") {
        return b.slug !== target.slug;
      }
      if (b.kind === "surah" && target.kind === "surah") {
        return b.surah !== target.surah;
      }
      if (b.kind === "ayah" && target.kind === "ayah") {
        return !(b.surah === target.surah && b.ayah === target.ayah);
      }
      return true;
    });
  } else {
    updated = [target, ...all];
  }

  localStorage.setItem(KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bookmarks-updated"));
  return !exists;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkTarget[]>(getBookmarks);

  useEffect(() => {
    const handler = () => setBookmarks(getBookmarks());
    window.addEventListener("bookmarks-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("bookmarks-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    bookmarks,
    isBookmarked: (target: BookmarkTarget) =>
      bookmarks.some((b) => {
        if (b.kind === "article" && target.kind === "article") {
          return b.slug === target.slug;
        }
        if (b.kind === "surah" && target.kind === "surah") {
          return b.surah === target.surah;
        }
        if (b.kind === "ayah" && target.kind === "ayah") {
          return b.surah === target.surah && b.ayah === target.ayah;
        }
        return false;
      }),
    toggle: (target: BookmarkTarget) => toggleBookmark(target),
    removeBookmark: (target: BookmarkTarget) => toggleBookmark(target),
    clearBookmarks: () => {
      localStorage.removeItem(KEY);
      window.dispatchEvent(new Event("bookmarks-updated"));
    },
  };
}