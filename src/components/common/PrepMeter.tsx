import { cn } from "@/lib/utils";

export function prepLabel(v: number) {
  if (v >= 80) return "Preparada";
  if (v >= 50) return "Em progresso";
  if (v >= 25) return "Início";
  return "Não iniciada";
}

/** Four-step meter for exam preparation. */
export function PrepMeter({ value, className, showLabel = true }: { value: number; className?: string; showLabel?: boolean }) {
  const steps = 4;
  const filled = Math.round((value / 100) * steps);
  const tone = value >= 80 ? "bg-success" : value >= 50 ? "bg-primary" : value >= 25 ? "bg-warning" : "bg-border-strong";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-0.5" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Nível de preparação">
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} className={cn("h-1.5 w-3.5 rounded-[2px]", i < filled ? tone : "bg-muted ring-1 ring-inset ring-border")} />
        ))}
      </div>
      {showLabel && <span className="text-xs text-muted-foreground">{prepLabel(value)}</span>}
    </div>
  );
}
