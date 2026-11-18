import { useEffect, useState, type FormEvent } from "react";
import { addDays } from "date-fns";
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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/common/Field";
import { SubjectDot } from "@/components/common/SubjectTag";
import { prepLabel } from "@/components/common/PrepMeter";
import { actions, useStudora } from "@/lib/data/store";
import type { Exam } from "@/lib/data/types";
import { fmt } from "@/lib/format";

export function ExamFormDialog({
  open,
  onOpenChange,
  exam,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  exam?: Exam;
}) {
  const subjects = useStudora((s) => s.subjects);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("08:00");
  const [weight, setWeight] = useState(30);
  const [topics, setTopics] = useState("");
  const [prep, setPrep] = useState(0);
  const [gradeStr, setGradeStr] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    const d = exam?.date ?? addDays(new Date(), 7).toISOString();
    setTitle(exam?.title ?? "");
    setSubjectId(exam?.subjectId ?? subjects[0]?.id ?? "");
    setDate(fmt(d, "yyyy-MM-dd"));
    setTime(exam ? fmt(d, "HH:mm") : "08:00");
    setWeight(exam?.weight ?? 30);
    setTopics(exam?.topics.join(", ") ?? "");
    setPrep(exam?.preparation ?? 0);
    setGradeStr(exam?.grade != null ? String(exam.grade).replace(".", ",") : "");
    setError(undefined);
  }, [open, exam, subjects]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Dê um nome para a avaliação.");
    const g = gradeStr.trim() ? Number(gradeStr.replace(",", ".")) : null;
    if (g !== null && (Number.isNaN(g) || g < 0 || g > 10)) return setError("A nota deve estar entre 0 e 10.");
    const payload = {
      title: title.trim(),
      subjectId,
      date: new Date(`${date}T${time}`).toISOString(),
      weight,
      topics: topics.split(",").map((t) => t.trim()).filter(Boolean),
      preparation: g !== null ? 100 : prep,
      grade: g,
    };
    if (exam) {
      actions.updateExam(exam.id, payload);
      toast.success("Avaliação atualizada");
    } else {
      actions.createExam(payload);
      toast.success("Avaliação agendada", { description: payload.title });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{exam ? "Editar avaliação" : "Nova avaliação"}</DialogTitle>
          <DialogDescription>Provas, testes e entregas avaliadas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Nome" htmlFor="ex-title" error={error}>
            <Input id="ex-title" autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setError(undefined); }} placeholder="Ex.: P3 — Teoremas integrais" />
          </Field>
          <Field label="Disciplina">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2"><SubjectDot subject={s} />{s.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-[1fr_7rem_5.5rem] gap-3">
            <Field label="Data" htmlFor="ex-date">
              <Input id="ex-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Horário" htmlFor="ex-time">
              <Input id="ex-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
            <Field label="Peso (%)" htmlFor="ex-weight">
              <Input id="ex-weight" type="number" min={0} max={100} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Conteúdos cobrados" htmlFor="ex-topics" hint={<span className="text-[11.5px] text-muted-foreground">separe por vírgulas</span>}>
            <Input id="ex-topics" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Green, Stokes, Divergente" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <Field label="Nível de preparação" hint={<span className="text-[12px] tabular text-muted-foreground">{prepLabel(prep)} · {prep}%</span>}>
              <Slider value={[prep]} onValueChange={([v]) => setPrep(v)} step={5} max={100} className="h-9" disabled={gradeStr.trim() !== ""} />
            </Field>
            <Field label="Nota obtida" htmlFor="ex-grade">
              <Input id="ex-grade" inputMode="decimal" value={gradeStr} onChange={(e) => { setGradeStr(e.target.value); setError(undefined); }} placeholder="—" />
            </Field>
          </div>
          <DialogFooter className="pt-1">
            {exam && (
              <Button type="button" variant="ghost" className="mr-auto text-destructive hover:bg-destructive-soft hover:text-destructive" onClick={() => { actions.deleteExam(exam.id); toast("Avaliação excluída"); onOpenChange(false); }}>
                Excluir
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{exam ? "Salvar" : "Agendar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
