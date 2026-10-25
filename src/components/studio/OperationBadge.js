import { OPERATIONS } from "@/config/studio";
import { cn } from "@/lib/cn";

/** Small label showing how a version was made (Origin, Vary, Refine, Remix). */
export default function OperationBadge({ operation, className }) {
  const { label, icon: Icon } = OPERATIONS[operation];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-[10.5px] font-medium text-muted",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
