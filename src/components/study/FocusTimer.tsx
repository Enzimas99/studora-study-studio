import { useEffect, useState } from "react";
import { Check, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "@/components/common/PageHeader";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { SubjectDot } from "@/components/common/SubjectTag";
import { actions, useStudora } from "@/lib/data/store";

type TimerPreset = "25" | "50" | "5";

const PRESET_MINUTES: Record<TimerPreset, number> = {
  "25": 25,
  "50": 50,
  "5": 5,
};

export function FocusTimer() {
  const subjects = useStudora((s) => s.subjects);
  const [preset, setPreset] = useState<TimerPreset>("25");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    if (!subjectId && subjects[0]?.id) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const totalSeconds = PRESET_MINUTES[preset] * 60;
  const elapsedSeconds = totalSeconds - secondsLeft;
  const progress = Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));

  useEffect(() => {
    if (secondsLeft === 0 && preset !== "5") {
      const mins = PRESET_MINUTES[preset];
      const subject = subjects.find((s) => s.id === subjectId);
      actions.createSession({
        subjectId: subjectId || subjects[0]?.id || "",
        topic: topic.trim() || `Sessão de foco (${mins} min)`,
        start: new Date(Date.now() - mins * 60_000).toISOString(),
        durationMin: mins,
        status: "concluida",
      });
      toast.success("Bloco de foco concluído!", {
        description: `${mins} min registrados${subject ? ` em ${subject.name}` : ""}.`,
      });
      setSecondsLeft(mins * 60);
    } else if (secondsLeft === 0 && preset === "5") {
      toast("Pausa encerrada — pronto para retomar!");
      setSecondsLeft(5 * 60);
    }
  }, [secondsLeft, preset, subjectId, subjects, topic]);

  function changePreset(next: TimerPreset) {
    setRunning(false);
    setPreset(next);
    setSecondsLeft(PRESET_MINUTES[next] * 60);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(PRESET_MINUTES[preset] * 60);
  }

  function logElapsedNow() {
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    const subject = subjects.find((s) => s.id === subjectId);
    actions.createSession({
      subjectId: subjectId || subjects[0]?.id || "",
      topic: topic.trim() || `Estudo focado (${mins} min)`,
      start: new Date(Date.now() - mins * 60_000).toISOString(),
      durationMin: mins,
      status: "concluida",
    });
    toast.success("Tempo registrado no histórico", {
      description: `${mins} min${subject ? ` em ${subject.name}` : ""}`,
    });
    reset();
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <section className="p-4 sm:p-5">
      <SectionHeader title="Timer de foco" meta={preset === "5" ? "pausa" : "pomodoro"} />

      <SegmentedControl
        size="sm"
        value={preset}
        onChange={changePreset}
        aria-label="Modo do timer"
        className="mt-3 w-full [&>button]:flex-1"
        options={[
          { value: "25", label: "25 min" },
          { value: "50", label: "50 min" },
          { value: "5", label: "Pausa" },
        ]}
      />

      <div className="mt-4 rounded-lg border bg-card p-4 text-center shadow-xs">
        <div className="font-mono text-[40px] leading-none font-semibold tracking-[-0.03em] tabular">
          {mm}:{ss}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            type="button"
            variant={running ? "outline" : "default"}
            size="sm"
            onClick={() => setRunning((r) => !r)}
            className="min-w-28"
          >
            {running ? (
              <>
                <Pause /> Pausar
              </>
            ) : (
              <>
                <Play /> {elapsedSeconds > 0 ? "Retomar" : "Iniciar"}
              </>
            )}
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={reset} aria-label="Reiniciar timer">
            <RotateCcw />
          </Button>
        </div>
      </div>

      {preset !== "5" && (
        <div className="mt-3 grid gap-2">
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger className="h-8 bg-card text-[12.5px]">
              <SelectValue placeholder="Disciplina" />
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
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="O que você vai estudar agora?"
            className="h-8 bg-card text-[12.5px]"
          />
          {elapsedSeconds >= 60 && (
            <Button type="button" variant="outline" size="sm" onClick={logElapsedNow} className="mt-0.5">
              <Check /> Registrar {Math.max(1, Math.round(elapsedSeconds / 60))} min agora
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
