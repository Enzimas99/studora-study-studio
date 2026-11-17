import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { differenceInCalendarDays, isSameWeek } from "date-fns";
import { useStudora } from "@/lib/data/store";
import { gradeAverage, upcomingExams, weeklyHours } from "@/lib/data/selectors";
import { grade, hours } from "@/lib/format";
import { cn } from "@/lib/utils";

function Cell({
  label,
  value,
  unit,
  foot,
  to,
  tone,
}: {
  label: string;
  value: string | number;
  unit?: string;
  foot: React.ReactNode;
  to: "/atividades" | "/provas" | "/planejamento";
  tone?: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col gap-3 p-4 transition-colors hover:bg-accent/50 focus-ring sm:p-5"
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-[28px] font-semibold leading-none tracking-[-0.03em] tabular", tone)}>
          {value}
        </span>
        {unit && <span className="text-[13px] text-muted-foreground">{unit}</span>}
      </div>
      <div className="text-[12.5px] text-muted-foreground">{foot}</div>
    </Link>
  );
}

export function SummaryStrip() {
  const tasks = useStudora((s) => s.tasks);
  const exams = useStudora((s) => s.exams);
  const sessions = useStudora((s) => s.sessions);
  const profile = useStudora((s) => s.profile);
  const now = new Date();

  const open = tasks.filter((t) => t.status !== "concluido");
  const overdue = open.filter((t) => new Date(t.due) < now).length;
  const thisWeek = open.filter((t) =>
    isSameWeek(new Date(t.due), now, { weekStartsOn: profile.weekStartsOn }),
  ).length;
  const next = upcomingExams(exams)[0];
  const daysToNext = next ? differenceInCalendarDays(new Date(next.date), now) : null;
  const weekMin = weeklyHours(sessions, profile.weekStartsOn).reduce((a, d) => a + d.doneMin, 0);
  const avg = gradeAverage(exams);

  return (
    <section
      aria-label="Resumo"
      className="surface grid grid-cols-2 divide-border overflow-hidden lg:grid-cols-4 [&>*]:border-border [&>*:nth-child(odd)]:border-r lg:[&>*]:border-r lg:[&>*:last-child]:border-r-0 [&>*:nth-child(-n+2)]:border-b lg:[&>*:nth-child(-n+2)]:border-b-0"
    >
      <Cell
        label="Pendentes"
        value={open.length}
        unit="atividades"
        to="/atividades"
        foot={
          overdue > 0 ? (
            <span className="text-destructive">{overdue} em atraso</span>
          ) : (
            `${thisWeek} vencem nesta semana`
          )
        }
      />
      <Cell
        label="Próxima prova"
        value={daysToNext === null ? "—" : daysToNext === 0 ? "Hoje" : daysToNext}
        unit={daysToNext && daysToNext > 0 ? (daysToNext === 1 ? "dia" : "dias") : undefined}
        to="/provas"
        tone={daysToNext !== null && daysToNext <= 3 ? "text-warning-ink" : undefined}
        foot={<span className="line-clamp-1">{next ? next.title : "Nenhuma agendada"}</span>}
      />
      <Cell
        label="Estudo na semana"
        value={hours(weekMin)}
        unit={`de ${profile.weeklyGoalHours} h`}
        to="/planejamento"
        foot={
          <span className="flex items-center gap-2">
            <span className="h-1 w-16 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, (weekMin / 60 / profile.weeklyGoalHours) * 100)}%` }}
              />
            </span>
            {Math.round((weekMin / 60 / profile.weeklyGoalHours) * 100)}% da meta
          </span>
        }
      />
      <Cell
        label="Média geral"
        value={avg === null ? "—" : grade(avg)}
        unit="/ 10"
        to="/provas"
        foot={`${exams.filter((e) => e.grade !== null).length} avaliações corrigidas`}
      />
    </section>
  );
}
