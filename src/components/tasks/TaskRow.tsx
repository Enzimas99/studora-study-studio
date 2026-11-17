import { differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";
import { SubjectTag } from "@/components/common/SubjectTag";
import { PriorityIcon, StatusIcon, STATUS_LABEL } from "@/components/common/TaskMeta";
import { useQuickActions } from "@/components/layout/quick-actions";
import { actions } from "@/lib/data/store";
import type { Subject, Task, TaskStatus } from "@/lib/data/types";
import { dueLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const NEXT: Record<TaskStatus, TaskStatus> = {
  pendente: "andamento",
  andamento: "concluido",
  concluido: "pendente",
};

export function dueTone(task: Task) {
  if (task.status === "concluido") return "text-muted-foreground";
  const d = differenceInCalendarDays(new Date(task.due), new Date());
  if (d < 0) return "text-destructive";
  if (d <= 2) return "text-warning-ink";
  return "text-muted-foreground";
}

export function StatusButton({ task, className }: { task: Task; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        const next = NEXT[task.status];
        actions.setTaskStatus(task.id, next);
        if (next === "concluido") toast.success("Atividade concluída", { description: task.title });
      }}
      aria-label={`Status: ${STATUS_LABEL[task.status]}. Alterar para ${STATUS_LABEL[NEXT[task.status]]}`}
      title={`Marcar como ${STATUS_LABEL[NEXT[task.status]].toLowerCase()}`}
      className={cn(
        "-m-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-[background-color,transform] hover:bg-accent active:scale-90 focus-ring",
        className,
      )}
    >
      <StatusIcon status={task.status} />
    </button>
  );
}

export function TaskRow({
  task,
  subject,
  showSubject = true,
  dense = false,
}: {
  task: Task;
  subject?: Subject;
  showSubject?: boolean;
  dense?: boolean;
}) {
  const { openTask } = useQuickActions();
  const done = task.status === "concluido";
  return (
    <li
      className={cn(
        "group flex cursor-pointer items-center gap-3 px-4 transition-colors hover:bg-accent/60",
        dense ? "py-2.5" : "py-3",
      )}
      onClick={() => openTask({ task })}
    >
      <StatusButton task={task} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13.5px]",
            done && "text-muted-foreground line-through decoration-border-strong",
          )}
        >
          {task.title}
        </span>
        {showSubject && <SubjectTag subject={subject} className="sm:w-44 sm:shrink-0" />}
      </div>
      <PriorityIcon priority={task.priority} className="hidden sm:block" />
      <span className={cn("w-[88px] shrink-0 text-right text-[12.5px] tabular", dueTone(task))}>
        {dueLabel(task.due)}
      </span>
    </li>
  );
}
