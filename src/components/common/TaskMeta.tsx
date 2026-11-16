import { cn } from "@/lib/utils";
import type { Priority, TaskStatus } from "@/lib/data/types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pendente: "Pendente",
  andamento: "Em andamento",
  concluido: "Concluído",
};

/** Three ascending bars; filled count reflects priority. */
export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
  const filled = priority === "alta" ? 3 : priority === "media" ? 2 : 1;
  return (
    <svg
      viewBox="0 0 14 14"
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      aria-label={`Prioridade ${PRIORITY_LABEL[priority].toLowerCase()}`}
      role="img"
    >
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1.5 + i * 4.25}
          y={9 - i * 3}
          width={2.75}
          height={4 + i * 3}
          rx={0.8}
          className={
            i < filled
              ? priority === "alta"
                ? "fill-warning-ink"
                : "fill-foreground/70"
              : "fill-border-strong"
          }
        />
      ))}
    </svg>
  );
}

/** Status glyph: empty ring, half-filled ring, checked disc. */
export function StatusIcon({ status, className }: { status: TaskStatus; className?: string }) {
  if (status === "concluido") {
    return (
      <svg viewBox="0 0 16 16" className={cn("h-4 w-4 shrink-0", className)} aria-hidden>
        <circle cx="8" cy="8" r="7" className="fill-success" />
        <path
          d="M5 8.2 7 10.2 11 6"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-card"
        />
      </svg>
    );
  }
  if (status === "andamento") {
    return (
      <svg viewBox="0 0 16 16" className={cn("h-4 w-4 shrink-0", className)} aria-hidden>
        <circle cx="8" cy="8" r="6.25" fill="none" strokeWidth="1.5" className="stroke-primary" />
        <path d="M8 4a4 4 0 0 1 0 8z" className="fill-primary" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={cn("h-4 w-4 shrink-0", className)} aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        strokeWidth="1.5"
        strokeDasharray="2.4 1.6"
        className="stroke-subtle"
      />
    </svg>
  );
}
