import { isToday } from "date-fns";
import { useStudora } from "@/lib/data/store";
import { weeklyHours } from "@/lib/data/selectors";
import { duration, fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Seven bars of completed study per day, with planned time stacked lightly on top. */
export function WeeklyBars({ height = 112, className }: { height?: number; className?: string }) {
  const sessions = useStudora((s) => s.sessions);
  const profile = useStudora((s) => s.profile);
  const days = weeklyHours(sessions, profile.weekStartsOn);
  const dailyGoal = (profile.weeklyGoalHours * 60) / 7;
  const max = Math.max(dailyGoal * 1.4, ...days.map((d) => d.doneMin + d.plannedMin));

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex items-end gap-2" style={{ height }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border-strong"
          style={{ bottom: `${(dailyGoal / max) * 100}%` }}
        >
          <span className="absolute -top-4 right-0 font-mono text-[10px] text-subtle">meta</span>
        </div>
        {days.map((d) => {
          const today = isToday(d.day);
          return (
            <div
              key={d.day.toISOString()}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={`${fmt(d.day, "EEEE")}: ${duration(d.doneMin)} estudados${d.plannedMin ? `, ${duration(d.plannedMin)} planejados` : ""}`}
            >
              {d.plannedMin > 0 && (
                <div
                  className="w-full rounded-t-[3px] border border-b-0 border-dashed border-primary/40 bg-primary/5"
                  style={{ height: `${(d.plannedMin / max) * 100}%` }}
                />
              )}
              <div
                className={cn(
                  "w-full transition-[height] duration-500",
                  d.plannedMin > 0 ? "" : "rounded-t-[3px]",
                  today ? "bg-primary" : "bg-foreground/80",
                  d.doneMin === 0 && "h-[2px]! bg-border-strong",
                )}
                style={{ height: `${(d.doneMin / max) * 100}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {days.map((d) => (
          <span
            key={d.day.toISOString()}
            className={cn(
              "flex-1 text-center text-[11px] uppercase",
              isToday(d.day) ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            {fmt(d.day, "EEEEE")}
          </span>
        ))}
      </div>
    </div>
  );
}
