import {
  addDays,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "@/lib/data/events";
import type { Subject } from "@/lib/data/types";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EventChip } from "./EventChip";

export function MonthView({
  cursor,
  events,
  subjects,
  weekStartsOn,
  selected,
  onSelectDay,
  onOpenDay,
  onOpenEvent,
}: {
  cursor: Date;
  events: CalendarEvent[];
  subjects: Record<string, Subject>;
  weekStartsOn: 0 | 1;
  selected: Date;
  onSelectDay: (d: Date) => void;
  onOpenDay: (d: Date) => void;
  onOpenEvent: (e: CalendarEvent) => void;
}) {
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  const headers = days.slice(0, 7);

  return (
    <div className="surface overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {headers.map((d) => (
          <div key={d.toISOString()} className="eyebrow px-2 py-2 text-center sm:text-left">
            <span className="sm:hidden">{fmt(d, "EEEEE")}</span>
            <span className="hidden sm:inline">{fmt(d, "EEE").replace(".", "")}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          const isSel = isSameDay(day, selected);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              onDoubleClick={() => onOpenDay(day)}
              className={cn(
                "group relative flex min-h-[58px] cursor-pointer flex-col border-border p-1 transition-colors sm:min-h-[112px] sm:p-1.5",
                i % 7 !== 6 && "border-r",
                i < days.length - 7 && "border-b",
                !inMonth && "bg-muted/35",
                isSel ? "bg-primary-soft/50" : "hover:bg-accent/40",
              )}
            >
              <div className="flex items-center justify-center sm:justify-between">
                <span
                  className={cn(
                    "flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-[12.5px] tabular",
                    today && "bg-primary font-semibold text-primary-foreground",
                    !today && !inMonth && "text-subtle",
                    !today && inMonth && "text-foreground",
                  )}
                >
                  {fmt(day, "d")}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDay(day);
                  }}
                  className="hidden rounded px-1 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground sm:block"
                >
                  Ver dia
                </button>
              </div>
              {/* Desktop: chips */}
              <div className="mt-1 hidden flex-col gap-0.5 sm:flex">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventChip key={e.id} event={e} subject={subjects[e.subjectId]} onClick={() => onOpenEvent(e)} />
                ))}
                {dayEvents.length > 3 && (
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onOpenDay(day);
                    }}
                    className="px-1.5 text-left text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    +{dayEvents.length - 3} mais
                  </button>
                )}
              </div>
              {/* Mobile: dots */}
              <div className="mt-1 flex flex-wrap justify-center gap-0.5 sm:hidden">
                {dayEvents.slice(0, 4).map((e) => {
                  const s = subjects[e.subjectId];
                  return (
                    <span
                      key={e.id}
                      className={cn("h-1.5 w-1.5 rounded-full", s ? SUBJECT_COLORS[s.color].dot : "bg-subtle", e.done && "opacity-40")}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
