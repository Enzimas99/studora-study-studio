import { cn } from "@/lib/utils";

export function UnderlineTabs<T extends string>({
  value,
  onChange,
  tabs,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("scrollbar-thin flex gap-5 overflow-x-auto border-b", className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative -mb-px flex h-10 shrink-0 items-center gap-1.5 border-b-2 text-[13.5px] font-medium transition-colors focus-ring",
              active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="rounded-[4px] bg-muted px-1.5 font-mono text-[10.5px] leading-[18px] text-muted-foreground tabular">
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
