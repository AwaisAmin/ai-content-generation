import Link from "next/link";
import { cn } from "@/lib/cn";

export default function Logo({ className }) {
  return (
    <Link
      href="/"
      aria-label="Fomi home"
      className={cn(
        "group inline-flex items-baseline rounded-lg text-[28px] leading-none font-bold tracking-tighter",
        className,
      )}
    >
      <span aria-hidden="true">F</span>
      <span
        aria-hidden="true"
        className="ml-0.5 size-1.5 rounded-full bg-accent transition-transform duration-300 ease-(--ease-spring) group-hover:scale-150"
      />
    </Link>
  );
}
