import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { startOfDay } from "date-fns";
import { Check, Circle, Clock, Plus, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader, SectionHeader } from "@/components/common/PageHeader";
import { PrepMeter } from "@/components/common/PrepMeter";
import { SubjectDot, SubjectTag } from "@/components/common/SubjectTag";
import { UnderlineTabs } from "@/components/common/UnderlineTabs";
import { FocusTimer } from "@/components/study/FocusTimer";
import { SessionFormDialog, type SessionDialogState } from "@/components/study/SessionFormDialog";
import { WeeklyBars } from "@/components/study/WeeklyBars";
import { daysUntil, subjectMap, upcomingExams, weeklyHours } from "@/lib/data/selectors";
import { actions, useStudora } from "@/lib/data/store";
import type { StudySession } from "@/lib/data/types";
import { duration, fmt, hours, relativeDay } from "@/lib/format";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento de estudos — Studora" },
      {
        name: "description",
        content: "Meta semanal, cronômetro de foco, distribuição por disciplina e blocos de estudo.",
      },
      { property: "og:title", content: "Planejamento de estudos — Studora" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: StudyPlanningPage,
});

type SessionTab = "proximas" | "concluidas" | "todas";

function StudyPlanningPage() {
  const data = useStudora((s) => s);
  const subjects = useMemo(() => subjectMap(data), [data]);
  const [tab, setTab] = useState<SessionTab>("proximas");
  const [subjectFilter, setSubjectFilter] = useState<string>("todas");
  const [dialog, setDialog] = useState<SessionDialogState>({ open: false });

  const week = weeklyHours(data.sessions, data.profile.weekStartsOn);
  const doneWeekMin = week.reduce((acc, d) => acc + d.doneMin, 0);
  const plannedWeekMin = week.reduce((acc, d) => acc + d.plannedMin, 0);
  const goalMin = data.profile.weeklyGoalHours * 60;
  const pct = goalMin > 0 ? Math.min(100, Math.round((doneWeekMin / goalMin) * 100)) : 0;
  const activeDays = week.filter((d) => d.doneMin > 0).length;

  const todayStart = startOfDay(new Date());

  const upcomingSessions = useMemo(
    () =>
      data.sessions
        .filter((s) => s.status === "planejada" && new Date(s.start) >= todayStart)
        .sort((a, b) => +new Date(a.start) - +new Date(b.start)),
    [data.sessions, todayStart],
  );

  const completedSessions = useMemo(
    () =>
      data.sessions
        .filter((s) => s.status === "concluida")
        .sort((a, b) => +new Date(b.start) - +new Date(a.start)),
    [data.sessions],
  );

  const allSorted = useMemo(
    () => [...data.sessions].sort((a, b) => +new Date(b.start) - +new Date(a.start)),
    [data.sessions],
  );

  const visibleSessions = useMemo(() => {
    const base =
      tab === "proximas"
        ? upcomingSessions
        : tab === "concluidas"
          ? completedSessions
          : allSorted;
    if (subjectFilter === "todas") return base;
    return base.filter((s) => s.subjectId === subjectFilter);
  }, [tab, upcomingSessions, completedSessions, allSorted, subjectFilter]);

  const bySubject = useMemo(() => {
    return data.subjects
      .map((s) => {
        const mins = data.sessions
          .filter((x) => x.subjectId === s.id && x.status === "concluida")
          .reduce((acc, x) => acc + x.durationMin, 0);
        return { subject: s, mins };
      })
      .sort((a, b) => b.mins - a.mins);
  }, [data.subjects, data.sessions]);

  const maxSubjectMin = Math.max(60, ...bySubject.map((x) => x.mins));

  const priorityExams = useMemo(
    () => upcomingExams(data.exams).filter((e) => e.preparation < 75).slice(0, 3),
    [data.exams],
  );

  function toggleSessionDone(s: StudySession) {
    const next = s.status === "concluida" ? "planejada" : "concluida";
    actions.setSessionStatus(s.id, next);
    toast(next === "concluida" ? "Sessão marcada como concluída" : "Sessão voltou para planejada", {
      description: s.topic,
    });
  }

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={`${hours(doneWeekMin)} de ${data.profile.weeklyGoalHours} h na semana · ${pct}% da meta`}
        title="Planejamento de estudos"
        description="Distribua seus blocos de foco, acompanhe a consistência diária e prepare-se para as próximas avaliações."
        actions={
          <Button onClick={() => setDialog({ open: true })}>
            <Plus /> Nova sessão
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Weekly summary & chart */}
          <section className="surface p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <SectionHeader title="Ritmo semanal" meta={`meta de ${data.profile.weeklyGoalHours} h`} />
                <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  <div>
                    <span className="text-[32px] font-semibold leading-none tracking-[-0.03em] tabular">
                      {hours(doneWeekMin)} h
                    </span>
                    <span className="ml-1.5 text-[12.5px] text-muted-foreground">concluídas</span>
                  </div>
                  {plannedWeekMin > 0 && (
                    <div className="text-[13px] text-muted-foreground tabular">
                      + <span className="font-medium text-foreground">{hours(plannedWeekMin)} h</span> planejadas
                    </div>
                  )}
                  <div className="text-[13px] text-muted-foreground tabular">
                    <span className="font-medium text-foreground">{activeDays}/7</span> dias ativos
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Meta:</span>
                {[10, 14, 20].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      actions.updateProfile({ weeklyGoalHours: g });
                      toast.success(`Meta semanal ajustada para ${g} h`);
                    }}
                    className={cn(
                      "h-7 rounded-md border px-2 font-mono text-xs transition-colors focus-ring tabular",
                      data.profile.weeklyGoalHours === g
                        ? "border-primary bg-primary-soft font-medium text-primary"
                        : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {g}h
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <WeeklyBars height={132} />
            </div>
          </section>

          {/* Suggested exam revisions */}
          {priorityExams.length > 0 && (
            <section className="surface p-4 sm:p-5">
              <SectionHeader
                title="Sugestões de revisão"
                meta="baseadas nas próximas provas"
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {priorityExams.map((exam) => {
                  const sub = subjects[exam.subjectId];
                  const dLeft = daysUntil(exam.date);
                  return (
                    <div
                      key={exam.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border bg-background/60 p-3.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <SubjectTag subject={sub} />
                          <span className="font-mono text-[11px] text-warning-ink tabular">
                            {dLeft <= 0 ? "Hoje" : `em ${dLeft}d`}
                          </span>
                        </div>
                        <p className="mt-2 text-[13.5px] font-medium">{exam.title}</p>
                        {exam.topics.length > 0 && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {exam.topics.join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <PrepMeter value={exam.preparation} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDialog({
                              open: true,
                              defaults: {
                                subjectId: exam.subjectId,
                                topic: `Revisão ${exam.title.split(" — ")[0]}: ${exam.topics[0] ?? exam.title}`,
                                durationMin: 60,
                              },
                            })
                          }
                        >
                          <Sparkles /> Agendar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sessions list */}
          <section className="surface overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b pr-4 sm:flex-row sm:items-center sm:pr-5">
              <UnderlineTabs
                className="border-b-0 px-4 sm:px-5"
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: "proximas", label: "Próximas", count: upcomingSessions.length },
                  { value: "concluidas", label: "Concluídas", count: completedSessions.length },
                  { value: "todas", label: "Todas", count: data.sessions.length },
                ]}
              />
              <div className="px-4 pb-3 sm:px-0 sm:pb-0">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="h-8 w-full text-[12.5px] sm:w-48">
                    <SelectValue placeholder="Disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as disciplinas</SelectItem>
                    {data.subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          <SubjectDot subject={s} />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {visibleSessions.length > 0 ? (
              <ul className="divide-y">
                {visibleSessions.map((session) => {
                  const sub = subjects[session.subjectId];
                  const done = session.status === "concluida";
                  const missed = session.status === "perdida";
                  return (
                    <li
                      key={session.id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 sm:px-5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSessionDone(session)}
                        aria-label={done ? "Marcar como planejada" : "Marcar como concluída"}
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors focus-ring",
                          done
                            ? "border-success bg-success text-white"
                            : missed
                              ? "border-destructive/50 text-destructive"
                              : "border-border-strong text-transparent hover:border-primary",
                        )}
                      >
                        {done ? (
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                        ) : missed ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDialog({ open: true, session })}
                        className="min-w-0 flex-1 text-left focus-ring"
                      >
                        <p className={cn("truncate text-[13.5px] font-medium", done && "text-muted-foreground line-through")}>
                          {session.topic}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground">
                          <span>{relativeDay(session.start)}</span>
                          <span className="text-subtle">·</span>
                          <span className="font-mono tabular">{fmt(session.start, "HH:mm")}</span>
                          {sub && (
                            <>
                              <span className="text-subtle sm:hidden">·</span>
                              <span className="sm:hidden">{sub.name}</span>
                            </>
                          )}
                        </div>
                      </button>

                      <span className="hidden sm:block">
                        <SubjectTag subject={sub} />
                      </span>

                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-[11.5px] text-muted-foreground tabular">
                        <Clock className="h-3 w-3" />
                        {duration(session.durationMin)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                title="Nenhuma sessão encontrada"
                description="Agende um bloco de estudo ou inicie o timer de foco ao lado."
                action={
                  <Button variant="outline" size="sm" onClick={() => setDialog({ open: true })}>
                    <Plus /> Agendar sessão
                  </Button>
                }
              />
            )}
          </section>
        </div>

        {/* Right rail */}
        <aside className="flex flex-col divide-y self-start rounded-xl bg-rail ring-1 ring-border">
          <FocusTimer />

          <section className="p-4 sm:p-5">
            <div className="eyebrow mb-3">Tempo acumulado por disciplina</div>
            <ul className="flex flex-col gap-3">
              {bySubject.map(({ subject, mins }) => {
                const color = SUBJECT_COLORS[subject.color];
                return (
                  <li key={subject.id}>
                    <div className="flex items-center justify-between gap-2 text-[12.5px]">
                      <span className="flex min-w-0 items-center gap-2">
                        <SubjectDot subject={subject} />
                        <span className="truncate">{subject.name}</span>
                      </span>
                      <span className="font-mono text-xs text-muted-foreground tabular">
                        {duration(mins)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-[width] duration-500", color.dot)}
                        style={{ width: `${Math.max(3, (mins / maxSubjectMin) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>

      <SessionFormDialog
        state={dialog}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </div>
  );
}
