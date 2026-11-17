import { Link } from "@tanstack/react-router";
import { differenceInCalendarDays } from "date-fns";
import { ArrowRight, GraduationCap } from "lucide-react";
import { SectionHeader } from "@/components/common/PageHeader";
import { SubjectTag } from "@/components/common/SubjectTag";
import { PriorityIcon } from "@/components/common/TaskMeta";
import { PrepMeter } from "@/components/common/PrepMeter";
import { StatusButton } from "@/components/tasks/TaskRow";
import { useQuickActions } from "@/components/layout/quick-actions";
import { useStudora } from "@/lib/data/store";
import { prioritized, subjectMap, upcomingExams } from "@/lib/data/selectors";
import { cn } from "@/lib/utils";

function reason(dueIso: string) {
  const d = differenceInCalendarDays(new Date(dueIso), new Date());
  if (d < 0) return { text: `Atrasada há ${Math.abs(d)} ${Math.abs(d) === 1 ? "dia" : "dias"}`, tone: "text-destructive" };
  if (d === 0) return { text: "Vence hoje", tone: "text-warning-ink" };
  if (d === 1) return { text: "Vence amanhã", tone: "text-warning-ink" };
  return { text: `Vence em ${d} dias`, tone: "text-muted-foreground" };
}

/** Today's focus: overdue/urgent tasks plus the nearest under-prepared exam. */
export function FocusList() {
  const data = useStudora((s) => s);
  const { openTask } = useQuickActions();
  const subjects = subjectMap(data);
  const tasks = prioritized(data.tasks).slice(0, 4);
  const exam = upcomingExams(data.exams).find((e) => e.preparation < 70);

  return (
    <section className="surface">
      <div className="px-4 pt-4 pb-3 sm:px-5">
        <SectionHeader
          title="Prioridades"
          meta="ordenadas por urgência"
          action={
            <Link to="/atividades" className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground">
              Todas <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
      </div>
      <ol className="divide-y border-t">
        {tasks.map((t, i) => {
          const r = reason(t.due);
          return (
            <li
              key={t.id}
              onClick={() => openTask({ task: t })}
              className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 sm:gap-4 sm:px-5"
            >
              <span className="hidden w-4 font-mono text-[11px] text-subtle tabular sm:block">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <StatusButton task={t} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{t.title}</p>
                <div className="mt-0.5 flex items-center gap-3">
                  <SubjectTag subject={subjects[t.subjectId]} />
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={cn("text-[12.5px] font-medium", r.tone)}>{r.text}</span>
                <PriorityIcon priority={t.priority} />
              </div>
            </li>
          );
        })}
        {exam && (
          <li className="flex items-center gap-3 bg-primary-soft/50 px-4 py-3 sm:gap-4 sm:px-5">
            <span className="hidden w-4 sm:block" />
            <span className="-m-1.5 flex h-7 w-7 items-center justify-center text-primary">
              <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <Link to="/provas" className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">Revisar para {exam.title.split(" — ")[0]}</p>
              <div className="mt-0.5">
                <SubjectTag subject={subjects[exam.subjectId]} />
              </div>
            </Link>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-[12.5px] font-medium text-warning-ink">
                Prova em {differenceInCalendarDays(new Date(exam.date), new Date())} dias
              </span>
              <PrepMeter value={exam.preparation} showLabel={false} />
            </div>
          </li>
        )}
      </ol>
    </section>
  );
}
