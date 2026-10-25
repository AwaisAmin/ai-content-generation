"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV, isActivePath } from "@/config/navigation";
import { cn } from "@/lib/cn";

/**
 * Tool switcher. A pill slides along the track above the icons to mark the
 * current tool — `bar` sits in the desktop header (icons only, labels via
 * tooltip), `dock` is the mobile bottom tab bar (icons + labels).
 */
export default function PrimaryNav({ variant = "bar", className }) {
  const pathname = usePathname();
  const activeIndex = PRIMARY_NAV.findIndex((item) =>
    isActivePath(pathname, item.href),
  );
  const isDock = variant === "dock";

  return (
    <nav aria-label="Tools" className={className}>
      <div className="relative">
        <div
          aria-hidden="true"
          className={cn(
            "relative overflow-hidden rounded-full bg-surface-sunken",
            isDock ? "mx-3 h-1" : "h-2",
          )}
        >
          <span
            className={cn(
              "absolute inset-y-0 left-0 rounded-full bg-accent transition-[transform,opacity] duration-500 ease-spring",
              activeIndex === -1 && "opacity-0",
            )}
            style={{
              width: `${100 / PRIMARY_NAV.length}%`,
              transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
            }}
          />
        </div>

        <ul
          className="grid"
          style={{ gridTemplateColumns: `repeat(${PRIMARY_NAV.length}, minmax(0, 1fr))` }}
        >
          {PRIMARY_NAV.map(({ href, label, icon: Icon }, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={isDock ? undefined : label}
                  title={isDock ? undefined : label}
                  className={cn(
                    "group flex flex-col items-center justify-center rounded-xl transition-colors duration-200",
                    isDock
                      ? "h-14 w-full gap-1 text-[11px] font-medium"
                      : "mt-2 h-10 w-16",
                    isActive ? "text-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.25 : 1.75}
                    className="size-5 transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-active:scale-90"
                  />
                  {isDock && label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
