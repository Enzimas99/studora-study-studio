import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/common/PageHeader";
import { SubjectDot } from "@/components/common/SubjectTag";
import { useStudora } from "@/lib/data/store";
import { upcomingExams } from "@/lib/data/selectors";
import { fmt } from "@/lib/format";

export function SubjectsOverview() {
  const data = useStudora((s) => s);
  const rows = data.subjects.map((s) => {
    const pending = data.tasks.filter((t) => t.subjectId === s.id && t.status !== "concluido").length;
    const next = upcomingExams(data.exams.filter((e) => e.subjectId === s.id))[0];
    const studied = s.topics.filter((t) => t.studied).length;
    return { s, pending, next, progress: s.topics.length ? studied / s.topics.length : 0 };
  });

  return (
    <section className="surface">
      <div className="px-4 pt-4 pb-3 sm:px-5">
        <SectionHeader
          title="Disciplinas"
          meta={`${data.subjects.length} neste semestre`}
          action={
            <Link to="/disciplinas" className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground">
              Gerenciar <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
      </div>
      <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)_80px_minmax(0,1fr)] gap-4 border-y bg-muted/50 px-5 py-2 md:grid">
        <span className="eyebrow">Disciplina</span>
        <span className="eyebrow">Professor</span>
        <span className="eyebrow">Conteúdo</span>
        <span className="eyebrow text-right">Pendentes</span>
        <span className="eyebrow text-right">Próxima avaliação</span>
      </div>
      <ul className="divide-y border-t md:border-t-0">
        {rows.map(({ s, pending, next, progress }) => (
          <li key={s.id}>
            <Link
              to="/disciplinas/$subjectId"
              params={{ subjectId: s.id }}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-accent/60 sm:px-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)_80px_minmax(0,1fr)]"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <SubjectDot subject={s} className="h-2.5 w-2.5" />
                <span className="truncate text-[13.5px] font-medium">{s.name}</span>
              </span>
              <span className="hidden truncate text-[13px] text-muted-foreground md:block">{s.professor}</span>
              <span className="hidden items-center gap-2 md:flex">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${progress * 100}%` }} />
                </span>
                <span className="w-8 text-right text-[12px] text-muted-foreground tabular">{Math.round(progress * 100)}%</span>
              </span>
              <span className="hidden text-right text-[13px] tabular md:block">{pending || <span className="text-subtle">—</span>}</span>
              <span className="text-right text-[12.5px] text-muted-foreground tabular">
                {next ? fmt(next.date, "dd MMM").replace(".", "") : "—"}
              </span>
              <span className="col-span-2 truncate pl-5 text-[12px] text-muted-foreground md:hidden">
                {s.professor} · {pending} pendentes
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
