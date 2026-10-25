import {
  Folder,
  GitBranch,
  Headphones,
  House,
  Image as ImageIcon,
  Images,
  Video,
  WandSparkles,
} from "lucide-react";

/** Primary workspace tools, in the order they appear in the nav. */
export const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/image", label: "Image", icon: ImageIcon },
  { href: "/video", label: "Video", icon: Video },
  { href: "/edit", label: "Edit", icon: WandSparkles },
  { href: "/assets", label: "Assets", icon: Folder },
];

export const SECONDARY_NAV = [
  { href: "/studio", label: "Studio", icon: GitBranch },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/support", label: "Support", icon: Headphones },
];

export function isActivePath(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
