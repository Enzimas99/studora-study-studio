import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/common/PageHeader";
import { SubjectFormDialog } from "@/components/subjects/SubjectFormDialog";
import { SubjectActions } from "@/components/subjects/SubjectActions";
import { useStudora } from "@/lib/data/store";
import { upcomingExams } from "@/lib/data/selectors";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/disciplinas/")({
  head: () => ({
    meta: [
      { title: "Disciplinas — Studora" },
      { name: "description", content: "Todas as matérias do semestre com professores, atividades e próximas avaliações." },
      { property: "og:title", content: "Disciplinas — Studora" },
      { property: "og:description", content: "Matérias do semestre, professores e próximas avaliações." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const data = useStudora((s) => s);
  const [creating, setCreating] = useState(false);

  const rows = data.subjects.map((s) => {
    const tasks = data.tasks.filter((t) => t.subjectId === s.id);
    const open = tasks.filter((t) => t.status !== "concluido").length;
    const next = upcomingExams(data.exams.filter((e) => e.subjectId === s.id))[0];
    return { s, total: tasks.length, open, next };
  });
  const totalHours = data.subjects.reduce((a, s) => a + s.workload, 0);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={`Semestre 2026.2 · ${data.subjects.length} disciplinas · ${totalHours} h`}
        title="Disciplinas"
        description="Matérias em curso, quem leciona e o que vem a seguir em cada uma."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> Nova disciplina
          </Button>
        }
      />

      {rows.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={<BookOpen />}
            title="Nenhuma disciplina"
            description="Adicione as matérias do semestre para organizar atividades e provas."
            action={<Button onClick={() => setCreating(true)}><Plus /> Nova disciplina</Button>}
          />
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map(({ s, total, open, next }) => {
            const studied = s.topics.filter((t) => t.studied).length;
            const pct = s.topics.length ? Math.round((studied / s.topics.length) * 100) : 0;
            return (
              <li key={s.id} className="surface group relative overflow-hidden transition-shadow hover:shadow-md">
                <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", SUBJECT_COLORS[s.color].dot)} />
                <div className="flex items-start gap-3 p-4 pl-5 sm:p-5 sm:pl-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                      <span className="font-mono">{s.code}</span>
                      <span className="text-subtle">·</span>
                      <span>{s.semester}</span>
                    </div>
                    <Link
                      to="/disciplinas/$subjectId"
                      params={{ subjectId: s.id }}
                      className="mt-1 block truncate text-[15px] font-semibold tracking-[-0.01em] after:absolute after:inset-0 focus-ring"
                    >
                      {s.name}
                    </Link>
                    <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{s.professor}</p>
                  </div>
                  <div className="relative z-10">
                    <SubjectActions subject={s} />
                  </div>
                </div>
                <dl className="grid grid-cols-3 border-t text-[12.5px]">
                  <div className="px-4 py-3 pl-5 sm:pl-6">
                    <dt className="text-muted-foreground">Atividades</dt>
                    <dd className="mt-0.5 font-medium tabular">
                      {open} <span className="font-normal text-muted-foreground">/ {total}</span>
                    </dd>
                  </div>
                  <div className="border-l px-4 py-3">
                    <dt className="text-muted-foreground">Próxima avaliação</dt>
                    <dd className="mt-0.5 truncate font-medium">{next ? fmt(next.date, "dd MMM").replace(".", "") : "—"}</dd>
                  </div>
                  <div className="border-l px-4 py-3">
                    <dt className="text-muted-foreground">Conteúdo</dt>
                    <dd className="mt-1.5 flex items-center gap-2">
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className={cn("block h-full rounded-full", SUBJECT_COLORS[s.color].dot)} style={{ width: `${pct}%` }} />
                      </span>
                      <span className="text-[11.5px] tabular text-muted-foreground">{pct}%</span>
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
      <SubjectFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
