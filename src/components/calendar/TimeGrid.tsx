import { useEffect, useRef } from "react";
import { isSameDay, isToday } from "date-fns";
import type { CalendarEvent } from "@/lib/data/events";
import type { Subject } from "@/lib/data/types";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EventBlock } from "./EventChip";

const START_H = 7;
const END_H = 24;
const HOUR = 52;

/** Assigns side-by-side lanes to overlapping events. */
function layout(events: CalendarEvent[]) {
  const sorted = [...events].sort((a, b) => +a.start - +b.start);
  const out: { e: CalendarEvent; lane: number; lanes: number }[] = [];
  let cluster: typeof out = [];
  let clusterEnd = 0;
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => out.push({ ...c, lanes }));
    cluster = [];
  };
  for (const e of sorted) {
    const s = +e.start;
    const end = Math.max(+e.end, s + 30 * 60000);
    if (cluster.length && s >= clusterEnd) flush();
    const used = new Set(cluster.filter((c) => Math.max(+c.e.end, +c.e.start + 30 * 60000) > s).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ e, lane, lanes: 1 });
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();
  return out;
}

export function TimeGrid({
  days,
  events,
  subjects,
  onOpenEvent,
  onOpenDay,
}: {
  days: Date[];
  events: CalendarEvent[];
  subjects: Record<string, Subject>;
  onOpenEvent: (e: CalendarEvent) => void;
  onOpenDay?: (d: Date) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
  const now = new Date();
  const nowTop = (now.getHours() + now.getMinutes() / 60 - START_H) * HOUR;

  useEffect(() => {
    scroller.current?.scrollTo({ top: Math.max(0, (8 - START_H) * HOUR) });
  }, []);

  return (
    <div className="surface overflow-hidden">
      <div className="grid border-b bg-muted/50" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}>
        <div />
        {days.map((d) => (
          <button
            type="button"
            key={d.toISOString()}
            onClick={() => onOpenDay?.(d)}
            disabled={!onOpenDay}
            className="flex items-baseline gap-1.5 border-l px-2.5 py-2 text-left enabled:hover:bg-accent/50"
          >
            <span className="eyebrow">{fmt(d, "EEE").replace(".", "")}</span>
            <span
              className={cn(
                "flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-[13px] font-semibold tabular",
                isToday(d) && "bg-primary text-primary-foreground",
              )}
            >
              {fmt(d, "d")}
            </span>
          </button>
        ))}
      </div>
      <div ref={scroller} className="scrollbar-thin max-h-[640px] overflow-y-auto">
        <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))`, height: hours.length * HOUR }}>
          <div className="relative">
            {hours.map((h) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 font-mono text-[10.5px] text-subtle tabular" style={{ top: (h - START_H) * HOUR }}>
                {h > START_H ? `${h.toString().padStart(2, "0")}:00` : ""}
              </span>
            ))}
          </div>
          {days.map((d) => {
            const dayEvents = layout(events.filter((e) => isSameDay(e.start, d)));
            return (
              <div key={d.toISOString()} className={cn("relative border-l", isToday(d) && "bg-primary-soft/25")}>
                {hours.map((h) => (
                  <div key={h} className="absolute inset-x-0 border-t border-border/70" style={{ top: (h - START_H) * HOUR }} />
                ))}
                {dayEvents.map(({ e, lane, lanes }) => {
                  const startH = e.start.getHours() + e.start.getMinutes() / 60;
                  const dur = Math.max(30, (+e.end - +e.start) / 60000);
                  const top = Math.min((startH - START_H) * HOUR, (END_H - START_H) * HOUR - 26);
                  return (
                    <EventBlock
                      key={e.id}
                      event={e}
                      subject={subjects[e.subjectId]}
                      onClick={() => onOpenEvent(e)}
                      style={{
                        top: Math.max(0, top) + 1,
                        height: Math.max(26, (dur / 60) * HOUR - 3),
                        left: `calc(${(lane / lanes) * 100}% + 3px)`,
                        width: `calc(${100 / lanes}% - 6px)`,
                      }}
                    />
                  );
                })}
                {isToday(d) && nowTop > 0 && (
                  <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: nowTop }}>
                    <div className="relative h-px bg-destructive">
                      <span className="absolute -top-[3px] -left-[3px] h-[7px] w-[7px] rounded-full bg-destructive" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
