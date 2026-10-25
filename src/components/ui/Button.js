import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary:
    "bg-accent text-accent-foreground shadow-soft hover:bg-accent-hover hover:shadow-lifted",
  secondary:
    "bg-surface text-foreground border border-border shadow-soft hover:border-subtle",
  ghost: "text-foreground hover:bg-surface-sunken",
};

const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2.5 px-6 text-base",
};

/** Button styling on its own, so links (`next/link`) can look like buttons. */
export function buttonClasses({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium whitespace-nowrap",
    "transition-[background-color,box-shadow,border-color,transform,opacity] duration-200 ease-(--ease-out-soft)",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-[1.15em] animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-[1.15em]" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
