import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/Button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <Logo />
      <span className="flex size-16 items-center justify-center rounded-3xl bg-accent-soft text-accent-text">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <div className="max-w-sm space-y-2">
        <p className="text-xs font-medium tracking-widest text-accent-text uppercase">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">This page wandered off</h1>
        <p className="text-sm leading-relaxed text-muted">
          The link may be broken or the page may have moved. Your creations are safe in the
          workspace.
        </p>
      </div>
      <Link href="/" className={buttonClasses()}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to workspace
      </Link>
    </main>
  );
}
