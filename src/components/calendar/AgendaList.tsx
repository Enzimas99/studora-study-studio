import { isSameDay } from "date-fns";
import type { CalendarEvent } from "@/lib/data/events";
import { EVENT_KIND_LABEL } from "@/lib/data/events";
import type { Subject } from "@/lib/data/types";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { capitalize, fmt, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { KIND_ICON } from "./EventChip";

/** Vertical list of events grouped by day; used on small screens and for the selected day. */
export function AgendaList({
  days,
  events,
  subjects,
  onOpenEvent,
  emptyLabel = "Nada agendado.",
}: {
  days: Date[];
  events: CalendarEvent[];
  subjects: Record<string, Subject>;
  onOpenEvent: (e: CalendarEvent) => void;
  emptyLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      {days.map((d) => {
        const items = events.filter((e) => isSameDay(e.start, d));
        return (
          <section key={d.toISOString()}>
            <h3 className="mb-2 flex items-baseline gap-2">
              <span className="text-[13px] font-semibold">{relativeDay(d)}</span>
              <span className="text-[12px] text-muted-foreground">{capitalize(fmt(d, "d 'de' MMMM"))}</span>
            </h3>
            {items.length === 0 ? (
              <p className="rounded-md border border-dashed px-3 py-3 text-[12.5px] text-muted-foreground">{emptyLabel}</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {items.map((e) => {
                  const s = subjects[e.subjectId];
                  const Icon = KIND_ICON[e.kind];
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onOpenEvent(e)}
                        className={cn(
                          "relative grid w-full grid-cols-[48px_1fr] gap-3 rounded-md bg-card py-2.5 pr-3 pl-3.5 text-left shadow-xs ring-1 ring-border transition-shadow hover:shadow-md focus-ring",
                          "before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-r-full",
                          s ? SUBJECT_COLORS[s.color].bar : "before:bg-subtle",
                          e.done && "opacity-60",
                        )}
                      >
                        <span className="font-mono text-[12px] tabular">{fmt(e.start, "HH:mm")}</span>
                        <span className="min-w-0">
                          <span className={cn("block truncate text-[13px] font-medium", e.done && "line-through")}>{e.title}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                            <Icon className={cn("h-3 w-3", s && SUBJECT_COLORS[s.color].text)} />
                            {EVENT_KIND_LABEL[e.kind]} · {s?.name}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
