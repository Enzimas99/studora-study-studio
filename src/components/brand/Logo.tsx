import { cn } from "@/lib/utils";

/** Typographic wordmark: serif "Studora" with a cobalt full stop. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  if (compact) {
    return (
      <span
        aria-label="Studora"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-current/15 font-serif text-[22px] leading-none",
          className,
        )}
      >
        S<span className="text-primary">.</span>
      </span>
    );
  }
  return (
    <span
      className={cn("font-serif text-[26px] leading-none tracking-[-0.01em]", className)}
      aria-label="Studora"
    >
      Studora<span className="text-primary">.</span>
    </span>
  );
}
