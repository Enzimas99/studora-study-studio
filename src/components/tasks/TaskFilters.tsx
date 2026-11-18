import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubjectDot } from "@/components/common/SubjectTag";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/components/common/TaskMeta";
import type { Priority, Subject, TaskStatus } from "@/lib/data/types";

export interface TaskFilterState {
  q: string;
  subject: string;
  status: "all" | TaskStatus;
  priority: "all" | Priority;
}

export const EMPTY_FILTERS: TaskFilterState = { q: "", subject: "all", status: "all", priority: "all" };

export function TaskFilters({
  value,
  onChange,
  subjects,
  hideStatus,
}: {
  value: TaskFilterState;
  onChange: (v: TaskFilterState) => void;
  subjects: Subject[];
  hideStatus?: boolean;
}) {
  const set = <K extends keyof TaskFilterState>(k: K, v: TaskFilterState[K]) => onChange({ ...value, [k]: v });
  const active =
    value.q !== "" || value.subject !== "all" || value.status !== "all" || value.priority !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-56">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder="Filtrar por título"
          className="h-8 pl-8 text-[13px]"
          aria-label="Filtrar por título"
        />
      </div>
      <Select value={value.subject} onValueChange={(v) => set("subject", v)}>
        <SelectTrigger className="h-8 w-[calc(50%-4px)] text-[13px] sm:w-48" aria-label="Disciplina">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as disciplinas</SelectItem>
          {subjects.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              <span className="flex items-center gap-2">
                <SubjectDot subject={s} />
                {s.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!hideStatus && (
        <Select value={value.status} onValueChange={(v) => set("status", v as TaskFilterState["status"])}>
          <SelectTrigger className="h-8 w-[calc(50%-4px)] text-[13px] sm:w-40" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={value.priority} onValueChange={(v) => set("priority", v as TaskFilterState["priority"])}>
        <SelectTrigger className="h-8 w-[calc(50%-4px)] text-[13px] sm:w-40" aria-label="Prioridade">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Qualquer prioridade</SelectItem>
          {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
            <SelectItem key={p} value={p}>
              Prioridade {PRIORITY_LABEL[p].toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {active && (
        <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
          <X /> Limpar
        </Button>
      )}
    </div>
  );
}
