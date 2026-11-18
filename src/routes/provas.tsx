import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, SectionHeader } from "@/components/common/PageHeader";
import { SubjectDot, SubjectTag } from "@/components/common/SubjectTag";
import { ExamFormDialog } from "@/components/exams/ExamFormDialog";
import { gradeTone, UpcomingExamRow } from "@/components/exams/ExamList";
import { useStudora } from "@/lib/data/store";
import { gradeAverage, pastExams, subjectMap, upcomingExams } from "@/lib/data/selectors";
import type { Exam } from "@/lib/data/types";
import { fmt, grade } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provas")({
  head: () => ({
    meta: [
      { title: "Provas e notas — Studora" },
      { name: "description", content: "Próximas avaliações, notas obtidas, conteúdos cobrados e nível de preparação." },
      { property: "og:title", content: "Provas e notas — Studora" },
      { property: "og:description", content: "Avaliações, notas e preparação por disciplina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExamsPage,
});

const PASSING = 7;

function ExamsPage() {
  const data = useStudora((s) => s);
  const subjects = subjectMap(data);
  const upcoming = upcomingExams(data.exams);
  const past = pastExams(data.exams);
  const avg = gradeAverage(data.exams);
  const [dialog, setDialog] = useState<{ open: boolean; exam?: Exam }>({ open: false });

  const bySubject = data.subjects
    .map((s) => ({ s, avg: gradeAverage(data.exams.filter((e) => e.subjectId === s.id)) }))
    .filter((x) => x.avg !== null)
    .sort((a, b) => b.avg! - a.avg!);
  const below = bySubject.filter((x) => x.avg! < PASSING);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={`${upcoming.length} próximas · ${past.length} realizadas`}
        title="Provas e notas"
        description="Acompanhe o que vem pela frente e como você tem se saído."
        actions={
          <Button onClick={() => setDialog({ open: true })}>
            <Plus /> Nova avaliação
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="surface">
            <div className="px-4 pt-4 pb-3 sm:px-5">
              <SectionHeader title="Próximas avaliações" meta={upcoming.length} />
            </div>
            {upcoming.length ? (
              <ul className="divide-y border-t">
                {upcoming.map((e) => (
                  <UpcomingExamRow key={e.id} exam={e} subject={subjects[e.subjectId]} onClick={() => setDialog({ open: true, exam: e })} />
                ))}
              </ul>
            ) : (
              <EmptyState title="Nenhuma avaliação agendada" className="border-t" />
            )}
          </section>

          <section className="surface overflow-hidden">
            <div className="px-4 pt-4 pb-3 sm:px-5">
              <SectionHeader title="Avaliações anteriores" meta={past.length} />
            </div>
            <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_72px_56px_64px] gap-4 border-y bg-muted/50 px-5 py-2 sm:grid">
              <span className="eyebrow">Avaliação</span>
              <span className="eyebrow">Disciplina</span>
              <span className="eyebrow">Data</span>
              <span className="eyebrow text-right">Peso</span>
              <span className="eyebrow text-right">Nota</span>
            </div>
            <ul className="divide-y border-t sm:border-t-0">
              {past.map((e) => (
                <li
                  key={e.id}
                  onClick={() => setDialog({ open: true, exam: e })}
                  className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-4 py-3 transition-colors hover:bg-accent/50 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_72px_56px_64px] sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{e.title}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{e.topics.join(" · ")}</p>
                  </div>
                  <SubjectTag subject={subjects[e.subjectId]} className="order-3 col-span-1 sm:order-none" />
                  <span className="hidden text-[12.5px] text-muted-foreground tabular sm:block">{fmt(e.date, "dd/MM")}</span>
                  <span className="hidden text-right text-[12.5px] text-muted-foreground tabular sm:block">{e.weight}%</span>
                  <span className={cn("row-span-2 text-right text-[17px] font-semibold tabular sm:row-span-1", gradeTone(e.grade!))}>
                    {grade(e.grade!)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="self-start rounded-xl bg-rail ring-1 ring-border">
          <section className="p-4 sm:p-5">
            <SectionHeader title="Desempenho" meta="média ponderada" />
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[34px] font-semibold leading-none tracking-[-0.03em] tabular">{avg !== null ? grade(avg) : "—"}</span>
              <span className="text-[13px] text-muted-foreground">/ 10</span>
            </div>
            <p className="mt-2 text-[12.5px] text-muted-foreground">
              {below.length === 0
                ? `Todas as disciplinas acima de ${PASSING},0.`
                : `${below.length} ${below.length === 1 ? "disciplina abaixo" : "disciplinas abaixo"} da média ${PASSING},0.`}
            </p>
          </section>
          <section className="border-t p-4 sm:p-5">
            <div className="eyebrow mb-3">Por disciplina</div>
            <ul className="flex flex-col gap-3">
              {bySubject.map(({ s, avg }) => (
                <li key={s.id}>
                  <div className="flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="flex min-w-0 items-center gap-2">
                      <SubjectDot subject={s} />
                      <span className="truncate">{s.name}</span>
                    </span>
                    <span className={cn("font-medium tabular", gradeTone(avg!))}>{grade(avg!)}</span>
                  </div>
                  <div className="relative mt-1.5 h-1 rounded-full bg-muted ring-1 ring-inset ring-border">
                    <div className={cn("h-full rounded-full", avg! >= PASSING ? "bg-foreground/70" : "bg-warning")} style={{ width: `${avg! * 10}%` }} />
                    <span aria-hidden className="absolute -top-1 -bottom-1 w-px bg-foreground/40" style={{ left: `${PASSING * 10}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <span className="inline-block h-3 w-px bg-foreground/40" /> média mínima para aprovação ({PASSING},0)
            </p>
          </section>
        </aside>
      </div>

      <ExamFormDialog open={dialog.open} exam={dialog.exam} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
    </div>
  );
}
