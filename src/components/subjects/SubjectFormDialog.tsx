import { useEffect, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
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
import { Field } from "@/components/common/Field";
import { actions } from "@/lib/data/store";
import type { Subject, SubjectColor } from "@/lib/data/types";
import { SUBJECT_COLORS, SUBJECT_COLOR_KEYS } from "@/lib/subject-colors";
import { cn } from "@/lib/utils";

const EMPTY = {
  name: "",
  code: "",
  professor: "",
  semester: "2026.2",
  schedule: "",
  room: "",
  workload: 60,
  color: "cobalt" as SubjectColor,
};

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  subject?: Subject;
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(subject ? { ...EMPTY, ...subject } : EMPTY);
  }, [open, subject]);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Informe o nome da disciplina.";
    if (!form.professor.trim()) errs.professor = "Informe o professor.";
    if (Object.keys(errs).length) return setErrors(errs);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase() || "—",
      professor: form.professor.trim(),
      semester: form.semester.trim(),
      schedule: form.schedule.trim() || "A definir",
      room: form.room.trim() || "—",
      workload: Number(form.workload) || 60,
      color: form.color,
    };
    if (subject) {
      actions.updateSubject(subject.id, payload);
      toast.success("Disciplina atualizada");
    } else {
      actions.createSubject(payload);
      toast.success("Disciplina adicionada", { description: payload.name });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{subject ? "Editar disciplina" : "Nova disciplina"}</DialogTitle>
          <DialogDescription>Informações básicas da matéria neste semestre.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <Field label="Nome" htmlFor="sub-name" error={errors.name}>
              <Input id="sub-name" autoFocus value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Cálculo III" />
            </Field>
            <Field label="Código" htmlFor="sub-code">
              <Input id="sub-code" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="CM043" />
            </Field>
          </div>
          <Field label="Professor" htmlFor="sub-prof" error={errors.professor}>
            <Input id="sub-prof" value={form.professor} onChange={(e) => set("professor", e.target.value)} placeholder="Prof. Nome Sobrenome" />
          </Field>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Semestre" htmlFor="sub-sem">
              <Input id="sub-sem" value={form.semester} onChange={(e) => set("semester", e.target.value)} />
            </Field>
            <Field label="Sala" htmlFor="sub-room">
              <Input id="sub-room" value={form.room} onChange={(e) => set("room", e.target.value)} placeholder="PA-204" />
            </Field>
            <Field label="Carga horária" htmlFor="sub-wl" className="col-span-2 sm:col-span-1">
              <Input id="sub-wl" type="number" min={15} step={15} value={form.workload} onChange={(e) => set("workload", Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Horário" htmlFor="sub-sched">
            <Input id="sub-sched" value={form.schedule} onChange={(e) => set("schedule", e.target.value)} placeholder="Seg e Qua · 07:30" />
          </Field>
          <Field label="Cor de identificação">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor">
              {SUBJECT_COLOR_KEYS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={form.color === c}
                  aria-label={SUBJECT_COLORS[c].label}
                  title={SUBJECT_COLORS[c].label}
                  onClick={() => set("color", c)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md border transition-[box-shadow,border-color] focus-ring",
                    form.color === c ? "border-foreground/40 shadow-md" : "hover:border-border-strong",
                  )}
                >
                  <span className={cn("flex h-4 w-4 items-center justify-center rounded-[4px] text-card", SUBJECT_COLORS[c].dot)}>
                    {form.color === c && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </button>
              ))}
            </div>
          </Field>
          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{subject ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
