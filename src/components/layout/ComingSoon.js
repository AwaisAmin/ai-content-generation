import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

/** Placeholder for tools that are on the roadmap but not built yet. */
export default function ComingSoon({ icon: Icon, title, description }) {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-accent-soft text-accent-text">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest text-accent-text uppercase">
          Coming soon
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <Link href="/" className={buttonClasses({ variant: "secondary" })}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to workspace
      </Link>
    </div>
  );
}
