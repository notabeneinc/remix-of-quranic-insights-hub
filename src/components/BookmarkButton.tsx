import { Bookmark } from "lucide-react";
import { BookmarkTarget, useBookmarks } from "@/lib/bookmarks";
import { Button } from "@/components/ui/button";

interface BookmarkButtonProps {
  target: BookmarkTarget;
  variant?: "ghost" | "outline" | "default";
  size?: "icon" | "sm" | "default";
  className?: string;
}

// Named Export (import { BookmarkButton } এর জন্য)
export function BookmarkButton({
  target,
  variant = "ghost",
  size = "icon",
  className = "",
}: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useBookmarks();
  const active = isBookmarked(target);

  return (
    <Button
      variant={variant}
      size={size}
      aria-label={active ? "Remove bookmark" : "Bookmark"}
      title={active ? "বুকমার্ক রিমুভ করুন" : "বুকমার্ক করুন"}
      onClick={(e) => {
        e.stopPropagation();
        toggle(target);
      }}
      className={`${active ? "text-primary" : "text-muted-foreground"} ${className}`}
    >
      <Bookmark className={`size-4 ${active ? "fill-current" : ""}`} />
    </Button>
  );
}

// Default Export (নিরাপত্তার জন্য যদি কোথাও default import থাকে)
export default BookmarkButton;