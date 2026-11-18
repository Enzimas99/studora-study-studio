import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, SectionHeader } from "@/components/common/PageHeader";
import { UnderlineTabs } from "@/components/common/UnderlineTabs";
import { SubjectActions } from "@/components/subjects/SubjectActions";
import { TaskRow } from "@/components/tasks/TaskRow";
import { UpcomingExamRow, DateBlock, gradeTone } from "@/components/exams/ExamList";
import { MaterialRow } from "@/components/materials/MaterialRow";
import { useQuickActions } from "@/components/layout/quick-actions";
import { actions, useStudora } from "@/lib/data/store";
import { pastExams, upcomingExams } from "@/lib/data/selectors";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { grade } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/disciplinas/$subjectId")({
  head: () => ({
    meta: [
      { title: "Disciplina — Studora" },
      { name: "description", content: "Informações, trabalhos, provas, materiais e conteúdos estudados da disciplina." },
      { property: "og:title", content: "Disciplina — Studora" },
      { property: "og:description", content: "Tudo sobre uma disciplina em uma única página." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubjectDetail,
});

type Tab = "trabalhos" | "provas" | "materiais";

function SubjectDetail() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const { openTask } = useQuickActions();
  const data = useStudora((s) => s);
  const subject = data.subjects.find((s) => s.id === subjectId);
  const [tab, setTab] = useState<Tab>("trabalhos");
  const [topic, setTopic] = useState("");

  if (!subject) {
    return (
      <div className="surface">
        <EmptyState
          title="Disciplina não encontrada"
          description="Ela pode ter sido excluída."
          action={<Button asChild variant="outline"><Link to="/disciplinas">Ver disciplinas</Link></Button>}
        />
      </div>
    );
  }

  const tasks = data.tasks
    .filter((t) => t.subjectId === subject.id)
    .sort((a, b) => Number(a.status === "concluido") - Number(b.status === "concluido") || +new Date(a.due) - +new Date(b.due));
  const exams = data.exams.filter((e) => e.subjectId === subject.id);
  const upcoming = upcomingExams(exams);
  const past = pastExams(exams);
  const materials = data.materials.filter((m) => m.subjectId === subject.id);
  const studied = subject.topics.filter((t) => t.studied).length;
  const color = SUBJECT_COLORS[subject.color];

  function addTopic(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    actions.addTopic(subject!.id, topic.trim());
    setTopic("");
  }

  return (
    <div className="animate-rise">
      <Link to="/disciplinas" className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="h-3.5 w-3.5" /> Disciplinas
      </Link>

      <header className="mt-4 flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className={cn("mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-serif text-[22px]", color.soft, color.text)}>
            {subject.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="font-mono">{subject.code}</span>
              <span className="text-subtle">·</span>
              <span>Semestre {subject.semester}</span>
            </div>
            <h1 className="mt-0.5 text-[22px] font-semibold leading-tight tracking-[-0.02em] sm:text-2xl">{subject.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{subject.professor}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => openTask({ defaults: { subjectId: subject.id } })}>
            <Plus /> Atividade
          </Button>
          <SubjectActions subject={subject} showView={false} afterDelete={() => navigate({ to: "/disciplinas" })} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="surface min-w-0 self-start">
          <UnderlineTabs
            className="px-4 sm:px-5"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "trabalhos", label: "Trabalhos", count: tasks.length },
              { value: "provas", label: "Provas", count: exams.length },
              { value: "materiais", label: "Materiais", count: materials.length },
            ]}
          />
          {tab === "trabalhos" &&
            (tasks.length ? (
              <ul className="divide-y">
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} subject={subject} showSubject={false} />
                ))}
              </ul>
            ) : (
              <EmptyState title="Nenhuma atividade" description="As atividades desta disciplina aparecem aqui." />
            ))}
          {tab === "provas" && (
            <div>
              {upcoming.length > 0 && (
                <>
                  <div className="eyebrow border-b bg-muted/40 px-5 py-2">Próximas</div>
                  <ul className="divide-y">
                    {upcoming.map((e) => (
                      <UpcomingExamRow key={e.id} exam={e} subject={subject} showSubject={false} />
                    ))}
                  </ul>
                </>
              )}
              {past.length > 0 && (
                <>
                  <div className="eyebrow border-y bg-muted/40 px-5 py-2">Realizadas</div>
                  <ul className="divide-y">
                    {past.map((e) => (
                      <li key={e.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                        <DateBlock iso={e.date} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-medium">{e.title}</p>
                          <p className="text-[12px] text-muted-foreground">Peso {e.weight}%</p>
                        </div>
                        <span className={cn("text-[18px] font-semibold tabular", gradeTone(e.grade!))}>{grade(e.grade!)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {!exams.length && <EmptyState title="Nenhuma avaliação" />}
            </div>
          )}
          {tab === "materiais" &&
            (materials.length ? (
              <ul className="divide-y">
                {materials.map((m) => (
                  <MaterialRow key={m.id} material={m} subject={subject} showSubject={false} />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nenhum material"
                action={<Button asChild variant="outline" size="sm"><Link to="/materiais">Adicionar na biblioteca</Link></Button>}
              />
            ))}
        </section>

        <aside className="flex flex-col gap-6">
          <section className="surface p-4 sm:p-5">
            <SectionHeader title="Informações" />
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[13px]">
              <dt className="text-muted-foreground">Professor</dt>
              <dd className="text-right">{subject.professor}</dd>
              <dt className="text-muted-foreground">Horário</dt>
              <dd className="text-right">{subject.schedule}</dd>
              <dt className="text-muted-foreground">Sala</dt>
              <dd className="text-right">{subject.room}</dd>
              <dt className="text-muted-foreground">Carga horária</dt>
              <dd className="text-right tabular">{subject.workload} h</dd>
              <dt className="text-muted-foreground">Média parcial</dt>
              <dd className="text-right tabular">
                {past.length ? grade(past.reduce((a, e) => a + e.grade! * e.weight, 0) / past.reduce((a, e) => a + e.weight, 0)) : "—"}
              </dd>
            </dl>
          </section>

          <section className="surface">
            <div className="p-4 pb-3 sm:px-5">
              <SectionHeader title="Conteúdos estudados" meta={`${studied}/${subject.topics.length}`} />
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-500", color.dot)}
                  style={{ width: `${subject.topics.length ? (studied / subject.topics.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <ul className="border-t py-1">
              {subject.topics.map((t) => (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2 text-[13px] transition-colors hover:bg-accent/50 sm:px-5">
                    <input
                      type="checkbox"
                      checked={t.studied}
                      onChange={() => actions.toggleTopic(subject.id, t.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded-[4px] accent-primary"
                    />
                    <span className={cn(t.studied && "text-muted-foreground line-through decoration-border-strong")}>{t.title}</span>
                  </label>
                </li>
              ))}
            </ul>
            <form onSubmit={addTopic} className="flex gap-2 border-t p-3 sm:px-5">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Adicionar conteúdo" className="h-8 text-[13px]" />
              <Button type="submit" size="icon-sm" variant="outline" aria-label="Adicionar conteúdo">
                <Plus />
              </Button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
