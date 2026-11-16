import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/common/Field";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { SubjectDot } from "@/components/common/SubjectTag";
import { PriorityIcon, STATUS_LABEL } from "@/components/common/TaskMeta";
import { actions, useStudora } from "@/lib/data/store";
import type { Priority, Task, TaskStatus } from "@/lib/data/types";
import { fmt } from "@/lib/format";

export interface TaskDialogState {
  open: boolean;
  task?: Task;
  defaults?: Partial<Task>;
}

export function TaskFormDialog({
  state,
  onOpenChange,
}: {
  state: TaskDialogState;
  onOpenChange: (o: boolean) => void;
}) {
  const subjects = useStudora((s) => s.subjects);
  const editing = !!state.task;

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("23:59");
  const [priority, setPriority] = useState<Priority>("media");
  const [status, setStatus] = useState<TaskStatus>("pendente");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!state.open) return;
    const base = state.task ?? state.defaults ?? {};
    const due = base.due ?? addDays(new Date(), 3).toISOString();
    setTitle(base.title ?? "");
    setSubjectId(base.subjectId ?? subjects[0]?.id ?? "");
    setDate(fmt(due, "yyyy-MM-dd"));
    setTime(base.due ? fmt(due, "HH:mm") : "23:59");
    setPriority(base.priority ?? "media");
    setStatus(base.status ?? "pendente");
    setNotes(base.notes ?? "");
    setError(undefined);
  }, [state, subjects]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Dê um título para a atividade.");
      return;
    }
    const due = new Date(`${date}T${time || "23:59"}`).toISOString();
    const payload = { title: title.trim(), subjectId, due, priority, status, notes: notes.trim() || undefined };
    if (editing && state.task) {
      actions.updateTask(state.task.id, payload);
      toast.success("Atividade atualizada");
    } else {
      actions.createTask(payload);
      toast.success("Atividade criada", { description: title.trim() });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar atividade" : "Nova atividade"}</DialogTitle>
          <DialogDescription>
            {editing ? "Ajuste os detalhes da atividade." : "Trabalhos, listas, leituras ou qualquer entrega."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Título" htmlFor="task-title" error={error}>
            <Input
              id="task-title"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(undefined);
              }}
              placeholder="Ex.: Lista 5 — Teorema de Green"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Disciplina">
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
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
            </Field>
            <Field label="Status">
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-[1fr_7.5rem] gap-4">
            <Field label="Prazo" htmlFor="task-date">
              <Input id="task-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Horário" htmlFor="task-time">
              <Input id="task-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
          <Field label="Prioridade">
            <SegmentedControl
              aria-label="Prioridade"
              value={priority}
              onChange={setPriority}
              className="w-full [&>button]:flex-1"
              options={[
                { value: "baixa", label: "Baixa", icon: <PriorityIcon priority="baixa" /> },
                { value: "media", label: "Média", icon: <PriorityIcon priority="media" /> },
                { value: "alta", label: "Alta", icon: <PriorityIcon priority="alta" /> },
              ]}
            />
          </Field>
          <Field label="Observações" htmlFor="task-notes">
            <Textarea
              id="task-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
            />
          </Field>
          <DialogFooter className="pt-1">
            {editing && state.task && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-destructive hover:bg-destructive-soft hover:text-destructive"
                onClick={() => {
                  actions.deleteTask(state.task!.id);
                  toast("Atividade excluída");
                  onOpenChange(false);
                }}
              >
                Excluir
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editing ? "Salvar" : "Criar atividade"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
