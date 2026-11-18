import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { differenceInCalendarDays } from "date-fns";
import { CheckSquare, Columns3, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/common/PageHeader";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskKanban } from "@/components/tasks/TaskKanban";
import { EMPTY_FILTERS, TaskFilters, type TaskFilterState } from "@/components/tasks/TaskFilters";
import { useQuickActions } from "@/components/layout/quick-actions";
import { useStudora } from "@/lib/data/store";
import { subjectMap } from "@/lib/data/selectors";
import type { Task } from "@/lib/data/types";

export const Route = createFileRoute("/atividades")({
  head: () => ({
    meta: [
      { title: "Trabalhos e atividades — Studora" },
      { name: "description", content: "Organize trabalhos, listas e entregas em lista ou quadro Kanban." },
      { property: "og:title", content: "Trabalhos e atividades — Studora" },
      { property: "og:description", content: "Trabalhos e entregas em lista ou Kanban, com filtros." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

type View = "lista" | "kanban";
const VIEW_KEY = "studora:tasks-view";

function groupOf(t: Task) {
  if (t.status === "concluido") return "done";
  const d = differenceInCalendarDays(new Date(t.due), new Date());
  if (d < 0) return "late";
  if (d <= 7) return "week";
  return "later";
}

const GROUPS = [
  { key: "late", label: "Em atraso" },
  { key: "week", label: "Próximos 7 dias" },
  { key: "later", label: "Mais adiante" },
  { key: "done", label: "Concluídas" },
] as const;

function TasksPage() {
  const data = useStudora((s) => s);
  const subjects = subjectMap(data);
  const { openTask } = useQuickActions();
  const [view, setView] = useState<View>(() => (window.localStorage.getItem(VIEW_KEY) as View) || "lista");
  const [filters, setFilters] = useState<TaskFilterState>(EMPTY_FILTERS);
  useEffect(() => window.localStorage.setItem(VIEW_KEY, view), [view]);

  const filtered = useMemo(
    () =>
      data.tasks
        .filter((t) => (filters.subject === "all" ? true : t.subjectId === filters.subject))
        .filter((t) => (filters.status === "all" || view === "kanban" ? true : t.status === filters.status))
        .filter((t) => (filters.priority === "all" ? true : t.priority === filters.priority))
        .filter((t) => t.title.toLowerCase().includes(filters.q.toLowerCase()))
        .sort((a, b) => +new Date(a.due) - +new Date(b.due)),
    [data.tasks, filters, view],
  );

  const open = data.tasks.filter((t) => t.status !== "concluido").length;
  const done = data.tasks.length - open;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={`${open} em aberto · ${done} concluídas`}
        title="Trabalhos e atividades"
        description="Listas, trabalhos e entregas de todas as disciplinas."
        actions={
          <>
            <SegmentedControl
              aria-label="Visualização"
              value={view}
              onChange={setView}
              options={[
                { value: "lista", label: "Lista", icon: <List /> },
                { value: "kanban", label: "Kanban", icon: <Columns3 /> },
              ]}
            />
            <Button onClick={() => openTask()}>
              <Plus /> Nova
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <TaskFilters value={filters} onChange={setFilters} subjects={data.subjects} hideStatus={view === "kanban"} />
      </div>

      {filtered.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={<CheckSquare />}
            title="Nenhuma atividade encontrada"
            description="Ajuste os filtros ou crie uma nova atividade."
            action={
              <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                Limpar filtros
              </Button>
            }
          />
        </div>
      ) : view === "kanban" ? (
        <TaskKanban tasks={filtered} subjects={subjects} />
      ) : (
        <div className="surface overflow-hidden">
          <div className="hidden grid-cols-[1fr_auto] border-b bg-muted/50 px-4 py-2 sm:grid">
            <span className="eyebrow pl-8">Atividade</span>
            <span className="eyebrow flex gap-4">
              <span className="w-44">Disciplina</span>
              <span className="w-3.5" />
              <span className="w-[88px] text-right">Prazo</span>
            </span>
          </div>
          {GROUPS.map((g) => {
            const items = filtered.filter((t) => groupOf(t) === g.key);
            if (!items.length) return null;
            return (
              <div key={g.key}>
                <div className="flex items-center gap-2 border-b bg-rail/60 px-4 py-1.5">
                  <span className={g.key === "late" ? "text-[12px] font-semibold text-destructive" : "text-[12px] font-semibold"}>
                    {g.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{items.length}</span>
                </div>
                <ul className="divide-y border-b last:border-b-0">
                  {items.map((t) => (
                    <TaskRow key={t.id} task={t} subject={subjects[t.subjectId]} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
