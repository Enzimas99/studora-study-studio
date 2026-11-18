import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
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
import { actions, useStudora } from "@/lib/data/store";
import type { SessionStatus, StudySession } from "@/lib/data/types";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface SessionDialogState {
  open: boolean;
  session?: StudySession;
  defaults?: Partial<StudySession>;
}

const DURATION_PRESETS = [30, 45, 60, 90, 120];

export function SessionFormDialog({
  state,
  onOpenChange,
}: {
  state: SessionDialogState;
  onOpenChange: (open: boolean) => void;
}) {
  const subjects = useStudora((s) => s.subjects);
  const editing = !!state.session;

  const [topic, setTopic] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [durationMin, setDurationMin] = useState(60);
  const [status, setStatus] = useState<SessionStatus>("planejada");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!state.open) return;
    const base = state.session ?? state.defaults ?? {};
    const startIso = base.start ?? new Date().toISOString();
    setTopic(base.topic ?? "");
    setSubjectId(base.subjectId ?? subjects[0]?.id ?? "");
    setDate(fmt(startIso, "yyyy-MM-dd"));
    setTime(base.start ? fmt(startIso, "HH:mm") : "19:00");
    setDurationMin(base.durationMin ?? 60);
    setStatus(base.status ?? "planejada");
    setError(undefined);
  }, [state, subjects]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Informe o foco ou conteúdo da sessão.");
      return;
    }
    const start = new Date(`${date}T${time || "19:00"}`).toISOString();
    const payload = {
      topic: topic.trim(),
      subjectId,
      start,
      durationMin: Math.max(5, Math.min(720, Number(durationMin) || 60)),
      status,
    };
    if (editing && state.session) {
      actions.updateSession(state.session.id, payload);
      toast.success("Sessão atualizada");
    } else {
      actions.createSession(payload);
      toast.success("Sessão agendada", { description: topic.trim() });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar sessão de estudo" : "Nova sessão de estudo"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Ajuste o horário, duração ou status da sessão."
              : "Reserve um bloco de foco no seu planejamento semanal."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Tópico ou objetivo" htmlFor="session-topic" error={error}>
            <Input
              id="session-topic"
              autoFocus
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setError(undefined);
              }}
              placeholder="Ex.: Integrais triplas em coordenadas cilíndricas"
            />
          </Field>

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

          <div className="grid grid-cols-[1fr_7.5rem] gap-4">
            <Field label="Data" htmlFor="session-date">
              <Input
                id="session-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Field>
            <Field label="Início" htmlFor="session-time">
              <Input
                id="session-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Duração (minutos)"
            htmlFor="session-duration"
            hint={<span className="font-mono text-xs text-muted-foreground tabular">{durationMin} min</span>}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDurationMin(preset)}
                  className={cn(
                    "h-8 rounded-md border px-2.5 font-mono text-xs transition-colors focus-ring tabular",
                    durationMin === preset
                      ? "border-primary bg-primary-soft font-medium text-primary"
                      : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {preset}m
                </button>
              ))}
              <Input
                id="session-duration"
                type="number"
                min={5}
                max={720}
                step={5}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="ml-auto h-8 w-24 font-mono text-xs tabular"
              />
            </div>
          </Field>

          <Field label="Status">
            <SegmentedControl
              aria-label="Status da sessão"
              value={status}
              onChange={setStatus}
              className="w-full [&>button]:flex-1"
              options={[
                { value: "planejada", label: "Planejada" },
                { value: "concluida", label: "Concluída" },
                { value: "perdida", label: "Perdida" },
              ]}
            />
          </Field>

          <DialogFooter className="pt-1">
            {editing && state.session && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-destructive hover:bg-destructive-soft hover:text-destructive"
                onClick={() => {
                  actions.deleteSession(state.session!.id);
                  toast("Sessão removida");
                  onOpenChange(false);
                }}
              >
                Excluir
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editing ? "Salvar" : "Agendar sessão"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
