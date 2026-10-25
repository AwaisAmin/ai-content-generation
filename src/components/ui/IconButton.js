import { cn } from "@/lib/cn";

const VARIANTS = {
  ghost: "text-foreground/80 hover:bg-surface-sunken hover:text-foreground",
  surface:
    "bg-surface/85 text-foreground shadow-soft backdrop-blur-md hover:bg-surface",
  active: "bg-accent-soft text-accent-text",
};

const SIZES = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-[18px]",
  lg: "size-11 [&_svg]:size-5",
};

/**
 * Icon-only button. `label` is required: it becomes the accessible name and
 * the native tooltip, so an icon is never the only way to understand it.
 */
export default function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "transition-[background-color,color,scale] duration-200 ease-out-soft",
        "active:scale-90 disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}
