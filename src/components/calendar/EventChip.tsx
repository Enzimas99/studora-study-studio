import { BookOpen, Flag, GraduationCap } from "lucide-react";
import type { CalendarEvent, EventKind } from "@/lib/data/events";
import type { Subject } from "@/lib/data/types";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const KIND_ICON: Record<EventKind, typeof Flag> = {
  prova: GraduationCap,
  entrega: Flag,
  estudo: BookOpen,
  aula: BookOpen,
};

/** Compact single-line event used in the month grid. */
export function EventChip({ event, subject, onClick }: { event: CalendarEvent; subject?: Subject; onClick: () => void }) {
  const c = subject ? SUBJECT_COLORS[subject.color] : null;
  const Icon = KIND_ICON[event.kind];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex w-full items-center gap-1.5 truncate rounded-[4px] px-1.5 py-[3px] text-left text-[11.5px] leading-tight transition-colors focus-ring",
        event.kind === "prova" ? cn(c?.soft, "font-medium text-foreground") : "text-foreground/85 hover:bg-accent",
        event.done && "opacity-55",
      )}
    >
      <Icon className={cn("h-3 w-3 shrink-0", c?.text)} strokeWidth={2} />
      <span className="hidden font-mono text-[10.5px] text-muted-foreground xl:inline">{fmt(event.start, "HH:mm")}</span>
      <span className={cn("truncate", event.done && "line-through")}>{event.title}</span>
    </button>
  );
}

/** Positioned block used in the week/day time grids. */
export function EventBlock({
  event,
  subject,
  onClick,
  style,
}: {
  event: CalendarEvent;
  subject?: Subject;
  onClick: () => void;
  style: React.CSSProperties;
}) {
  const c = subject ? SUBJECT_COLORS[subject.color] : null;
  const Icon = KIND_ICON[event.kind];
  const minutes = (+event.end - +event.start) / 60000;
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        "absolute overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-left shadow-xs ring-1 ring-border transition-[box-shadow,transform] hover:z-10 hover:shadow-md focus-ring",
        c?.border,
        event.kind === "prova" ? c?.soft : "bg-card",
        event.kind === "prova" && "ring-0",
        event.done && "opacity-60",
      )}
    >
      <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
        <Icon className={cn("h-3 w-3 shrink-0", c?.text)} strokeWidth={2} />
        <span className="font-mono tabular">{fmt(event.start, "HH:mm")}</span>
      </div>
      <p className={cn("text-[12px] leading-snug font-medium", minutes < 50 ? "truncate" : "line-clamp-2", event.done && "line-through")}>
        {event.title}
      </p>
    </button>
  );
}
