import { cn } from "@/lib/cn";
import styles from "./Skeleton.module.css";

/** Decorative shimmer placeholder; announce loading state on the container. */
export default function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn(styles.skeleton, "rounded-card", className)}
      {...props}
    />
  );
}
