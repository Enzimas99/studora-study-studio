import { Link } from "@tanstack/react-router";
import { addDays, isSameDay, startOfDay } from "date-fns";
import { SectionHeader } from "@/components/common/PageHeader";
import { useStudora } from "@/lib/data/store";
import { buildEvents, EVENT_KIND_LABEL } from "@/lib/data/events";
import { subjectMap } from "@/lib/data/selectors";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { capitalize, fmt, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Timeline of the next days: exams, deadlines and study sessions. */
export function AgendaRail({ days = 4 }: { days?: number }) {
  const data = useStudora((s) => s);
  const subjects = subjectMap(data);
  const now = new Date();
  const start = startOfDay(now);
  const events = buildEvents(data).filter(
    (e) => e.start >= now && e.start < addDays(start, days) && !e.done,
  );
  const groups = Array.from({ length: days }, (_, i) => addDays(start, i))
    .map((day) => ({ day, items: events.filter((e) => isSameDay(e.start, day)) }))
    .filter((g) => g.items.length);

  return (
    <section className="p-4 sm:p-5">
      <SectionHeader
        title="Compromissos"
        meta={`próximos ${days} dias`}
        action={
          <Link to="/calendario" className="text-[12.5px] text-muted-foreground hover:text-foreground">
            Calendário
          </Link>
        }
      />
      <div className="mt-4 flex flex-col gap-5">
        {groups.length === 0 && <p className="text-[13px] text-muted-foreground">Nada agendado.</p>}
        {groups.map((g) => (
          <div key={g.day.toISOString()}>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-[12px] font-semibold">
                {["Hoje", "Amanhã"].includes(relativeDay(g.day))
                  ? relativeDay(g.day)
                  : capitalize(fmt(g.day, "EEEE").replace("-feira", ""))}
              </span>
              <span className="text-[11.5px] text-muted-foreground">{capitalize(fmt(g.day, "d 'de' MMMM"))}</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {g.items.map((e) => {
                const s = subjects[e.subjectId];
                return (
                  <li
                    key={e.id}
                    className={cn(
                      "relative grid grid-cols-[44px_1fr] gap-3 rounded-md bg-card py-2 pr-3 pl-3 shadow-xs ring-1 ring-border",
                      "before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-r-full",
                      s ? SUBJECT_COLORS[s.color].bar : "before:bg-subtle",
                    )}
                  >
                    <span className="pt-px font-mono text-[12px] tabular text-foreground">{fmt(e.start, "HH:mm")}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium leading-snug">{e.title}</p>
                      <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                        <span className={cn(e.kind === "prova" && "font-medium text-warning-ink")}>{EVENT_KIND_LABEL[e.kind]}</span>
                        {" · "}
                        {s?.name}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
