import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import PrimaryNav from "@/components/layout/PrimaryNav";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { buttonClasses } from "@/components/ui/Button";
import { SECONDARY_NAV } from "@/config/navigation";

const AVATAR_SRC =
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1680px] grid-cols-[1fr_auto] items-center gap-4 px-4 md:h-20 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <Logo className="justify-self-start" />

        <PrimaryNav className="hidden w-[min(400px,40vw)] md:block" />

        <div className="flex items-center justify-self-end gap-1 sm:gap-2">
          {SECONDARY_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={buttonClasses({
                variant: "secondary",
                size: "sm",
                className:
                  "size-9 px-0 text-muted hover:text-foreground lg:w-auto lg:px-3",
              })}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}

          <ThemeToggle />

          <span className="relative ml-1 inline-flex size-9 overflow-hidden rounded-full ring-2 ring-surface shadow-soft">
            <Image
              src={AVATAR_SRC}
              alt="Your profile"
              width={36}
              height={36}
              // Always above the fold in the sticky header.
              loading="eager"
              className="size-full object-cover"
            />
          </span>
        </div>
      </div>
    </header>
  );
}
