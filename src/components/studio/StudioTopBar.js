"use client";

import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useStudio } from "@/components/studio/StudioProvider";
import { buttonClasses } from "@/components/ui/Button";

export default function StudioTopBar() {
  const { project } = useStudio();
  const selects = project?.versions.filter((version) => version.starred).length ?? 0;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <Logo className="text-2xl" />
      <span aria-hidden="true" className="text-muted">/</span>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold">{project?.name ?? "Studio"}</h1>
        {project?.brief && (
          <p className="hidden truncate text-[11px] text-muted lg:block">{project.brief}</p>
        )}
      </div>

      {project && (
        <span className="hidden items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs shadow-soft sm:inline-flex">
          <Star className="size-3 fill-accent text-accent" aria-hidden="true" />
          {selects} {selects === 1 ? "select" : "selects"}
        </span>
      )}
      <ThemeToggle />
      <Link
        href="/"
        className={buttonClasses({ variant: "secondary", size: "sm", className: "max-sm:size-9 max-sm:px-0" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <span className="max-sm:sr-only">Create</span>
      </Link>
    </header>
  );
}
