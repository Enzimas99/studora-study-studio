import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SubjectTag } from "@/components/common/SubjectTag";
import { PriorityIcon, StatusIcon, STATUS_LABEL } from "@/components/common/TaskMeta";
import { useQuickActions } from "@/components/layout/quick-actions";
import { actions } from "@/lib/data/store";
import type { Subject, Task, TaskStatus } from "@/lib/data/types";
import { dueLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { dueTone, StatusButton } from "./TaskRow";

const COLUMNS: TaskStatus[] = ["pendente", "andamento", "concluido"];

export function TaskKanban({ tasks, subjects }: { tasks: Task[]; subjects: Record<string, Subject> }) {
  const { openTask } = useQuickActions();
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);

  function drop(status: TaskStatus) {
    const t = tasks.find((x) => x.id === dragId);
    if (t && t.status !== status) {
      actions.setTaskStatus(t.id, status);
      toast(`Movida para ${STATUS_LABEL[status].toLowerCase()}`, { description: t.title });
    }
    setDragId(null);
    setOver(null);
  }

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-thin sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
      {COLUMNS.map((status) => {
        const items = tasks.filter((t) => t.status === status);
        return (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(status);
            }}
            onDragLeave={() => setOver((o) => (o === status ? null : o))}
            onDrop={() => drop(status)}
            className={cn(
              "flex w-[82vw] max-w-[340px] shrink-0 snap-start flex-col rounded-xl bg-rail p-2 ring-1 ring-border transition-[box-shadow,background-color] sm:w-auto sm:max-w-none",
              over === status && dragId && "bg-primary-soft/60 ring-primary/40",
            )}
          >
            <header className="flex items-center gap-2 px-2 pt-1.5 pb-2.5">
              <StatusIcon status={status} />
              <h2 className="text-[13px] font-semibold">{STATUS_LABEL[status]}</h2>
              <span className="font-mono text-[11px] text-muted-foreground tabular">{items.length}</span>
              <button
                type="button"
                onClick={() => openTask({ defaults: { status } })}
                aria-label={`Nova atividade em ${STATUS_LABEL[status]}`}
                className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-ring"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </header>
            <ul className="flex min-h-24 flex-1 flex-col gap-2">
              {items.map((t) => (
                <li
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOver(null);
                  }}
                  onClick={() => openTask({ task: t })}
                  className={cn(
                    "group cursor-grab rounded-lg border bg-card p-3 shadow-xs transition-[box-shadow,opacity,transform] hover:shadow-md active:cursor-grabbing",
                    dragId === t.id && "opacity-40",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <StatusButton task={t} className="mt-px" />
                    <p className={cn("min-w-0 flex-1 text-[13.5px] leading-snug font-medium", t.status === "concluido" && "text-muted-foreground line-through decoration-border-strong")}>
                      {t.title}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-3 pl-[26px]">
                    <SubjectTag subject={subjects[t.subjectId]} className="flex-1" />
                    <PriorityIcon priority={t.priority} />
                    <span className={cn("text-[12px] tabular", dueTone(t))}>{dueLabel(t.due)}</span>
                  </div>
                </li>
              ))}
              {items.length === 0 && (
                <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed py-8 text-[12.5px] text-muted-foreground">
                  Arraste atividades para cá
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
