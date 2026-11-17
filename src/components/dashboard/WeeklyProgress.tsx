import { Link } from "@tanstack/react-router";
import { SectionHeader } from "@/components/common/PageHeader";
import { WeeklyBars } from "@/components/study/WeeklyBars";
import { useStudora } from "@/lib/data/store";
import { weeklyHours } from "@/lib/data/selectors";
import { hours } from "@/lib/format";

export function WeeklyProgress() {
  const sessions = useStudora((s) => s.sessions);
  const profile = useStudora((s) => s.profile);
  const days = weeklyHours(sessions, profile.weekStartsOn);
  const done = days.reduce((a, d) => a + d.doneMin, 0);
  const planned = days.reduce((a, d) => a + d.plannedMin, 0);

  return (
    <section className="p-4 sm:p-5">
      <SectionHeader
        title="Progresso semanal"
        action={
          <Link to="/planejamento" className="text-[12.5px] text-muted-foreground hover:text-foreground">
            Planejar
          </Link>
        }
      />
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[26px] font-semibold leading-none tracking-[-0.03em] tabular">{hours(done)}h</span>
        <span className="text-[13px] text-muted-foreground">
          estudadas · +{hours(planned)}h planejadas
        </span>
      </div>
      <WeeklyBars className="mt-6" />
    </section>
  );
}
