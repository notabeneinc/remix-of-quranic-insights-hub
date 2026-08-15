import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useSocialLinks } from "@/lib/site";

const ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  telegram: Send,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
};

export function socialIconFor(platform: string): LucideIcon {
  return ICONS[platform.trim().toLowerCase()] ?? Globe;
}

export const SOCIAL_PLATFORMS = Object.keys(ICONS);

export function SocialLinks({ className = "" }: { className?: string }) {
  const links = useSocialLinks();
  if (!links.data?.length) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {links.data.map((l) => {
        const Icon = socialIconFor(l.platform);
        const label = l.label || l.platform;
        return (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={label}
            title={label}
            className="flex size-9 items-center justify-center rounded-md border border-white/15 text-white/75 transition-all duration-200 hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <Icon className="size-4" />
          </a>
        );
      })}
    </div>
  );
}
