import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  addDays,
  addMonths,
  addWeeks,
  isSameMonth,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  GraduationCap,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgendaList } from "@/components/calendar/AgendaList";
import { MonthView } from "@/components/calendar/MonthView";
import { TimeGrid } from "@/components/calendar/TimeGrid";
import { PageHeader, SectionHeader } from "@/components/common/PageHeader";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { SubjectDot } from "@/components/common/SubjectTag";
import { ExamFormDialog } from "@/components/exams/ExamFormDialog";
import { useQuickActions } from "@/components/layout/quick-actions";
import { SessionFormDialog, type SessionDialogState } from "@/components/study/SessionFormDialog";
import { buildEvents, type CalendarEvent, type EventKind } from "@/lib/data/events";
import { subjectMap, weekDays } from "@/lib/data/selectors";
import { useStudora } from "@/lib/data/store";
import type { Exam } from "@/lib/data/types";
import { capitalize, fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Studora" },
      {
        name: "description",
        content: "Provas, entregas e sessões de estudo reunidas em visões mensal, semanal, diária e agenda.",
      },
      { property: "og:title", content: "Calendário — Studora" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CalendarPage,
});

type CalendarView = "mes" | "semana" | "dia" | "agenda";
type KindFilter = "todos" | EventKind;

function CalendarPage() {
  const data = useStudora((s) => s);
  const { openTask } = useQuickActions();
  const subjects = useMemo(() => subjectMap(data), [data]);
  const allEvents = useMemo(() => buildEvents(data), [data]);

  const [view, setView] = useState<CalendarView>("mes");
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [kindFilter, setKindFilter] = useState<KindFilter>("todos");
  const [subjectFilter, setSubjectFilter] = useState<string>("todas");

  const [examDialog, setExamDialog] = useState<{ open: boolean; exam?: Exam }>({ open: false });
  const [sessionDialog, setSessionDialog] = useState<SessionDialogState>({ open: false });

  const filteredEvents = useMemo(
    () =>
      allEvents.filter((ev) => {
        if (kindFilter !== "todos" && ev.kind !== kindFilter) return false;
        if (subjectFilter !== "todas" && ev.subjectId !== subjectFilter) return false;
        return true;
      }),
    [allEvents, kindFilter, subjectFilter],
  );

  const monthEvents = useMemo(
    () => allEvents.filter((ev) => isSameMonth(ev.start, cursor)),
    [allEvents, cursor],
  );

  function shiftPeriod(dir: -1 | 1) {
    setCursor((prev) => {
      if (view === "mes") return dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1);
      if (view === "semana" || view === "agenda") return dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1);
      const next = dir === 1 ? addDays(prev, 1) : subDays(prev, 1);
      setSelected(next);
      return next;
    });
  }

  function goToday() {
    const now = new Date();
    setCursor(now);
    setSelected(now);
  }

  function handleOpenEvent(ev: CalendarEvent) {
    if (ev.kind === "entrega") {
      const task = data.tasks.find((t) => t.id === ev.refId);
      if (task) openTask({ task });
      return;
    }
    if (ev.kind === "prova") {
      const exam = data.exams.find((e) => e.id === ev.refId);
      if (exam) setExamDialog({ open: true, exam });
      return;
    }
    if (ev.kind === "estudo") {
      const session = data.sessions.find((s) => s.id === ev.refId);
      if (session) setSessionDialog({ open: true, session });
    }
  }

  function selectedIsoAt(hour: number, minute = 0) {
    const d = new Date(selected);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  const weekRange = weekDays(data.profile.weekStartsOn, cursor);
  const agendaRange = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: data.profile.weekStartsOn });
    return Array.from({ length: 14 }, (_, i) => addDays(start, i));
  }, [cursor, data.profile.weekStartsOn]);

  const periodLabel =
    view === "mes"
      ? capitalize(fmt(cursor, "MMMM 'de' yyyy"))
      : view === "dia"
        ? capitalize(fmt(cursor, "EEEE, d 'de' MMMM"))
        : `${fmt(weekRange[0], "d MMM").replace(".", "")} – ${fmt(weekRange[6], "d MMM yyyy").replace(".", "")}`;

  const monthExams = monthEvents.filter((e) => e.kind === "prova").length;
  const monthDeliveries = monthEvents.filter((e) => e.kind === "entrega").length;
  const monthSessions = monthEvents.filter((e) => e.kind === "estudo").length;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={`${monthEvents.length} compromissos em ${fmt(cursor, "MMMM")}`}
        title="Calendário"
        description="Visualize provas, prazos de entrega e blocos de estudo em uma linha do tempo única."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus /> Agendar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={() => openTask({ defaults: { due: selectedIsoAt(23, 59) } })}
              >
                <Flag /> Nova atividade
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  setSessionDialog({
                    open: true,
                    defaults: { start: selectedIsoAt(19, 0) },
                  })
                }
              >
                <BookOpen /> Sessão de estudo
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setExamDialog({ open: true })}>
                <GraduationCap /> Nova avaliação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border bg-card shadow-xs">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => shiftPeriod(-1)}
              aria-label="Período anterior"
              className="rounded-r-none"
            >
              <ChevronLeft />
            </Button>
            <button
              type="button"
              onClick={goToday}
              className="border-x px-3 h-8 text-[12.5px] font-medium text-foreground transition-colors hover:bg-accent focus-ring"
            >
              Hoje
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => shiftPeriod(1)}
              aria-label="Próximo período"
              className="rounded-l-none"
            >
              <ChevronRight />
            </Button>
          </div>
          <h2 className="ml-1 text-[15px] font-semibold tracking-[-0.01em]">{periodLabel}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            size="sm"
            value={view}
            onChange={setView}
            aria-label="Modo de visualização"
            options={[
              { value: "mes", label: "Mês" },
              { value: "semana", label: "Semana" },
              { value: "dia", label: "Dia" },
              { value: "agenda", label: "Agenda" },
            ]}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "todos", label: "Todos" },
              { id: "prova", label: "Provas" },
              { id: "entrega", label: "Entregas" },
              { id: "estudo", label: "Estudos" },
            ] as { id: KindFilter; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setKindFilter(item.id)}
              className={cn(
                "h-7 rounded-full border px-3 text-[12px] font-medium transition-colors focus-ring",
                kindFilter === item.id
                  ? "border-foreground bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="h-8 w-full bg-card text-[12.5px] sm:w-52">
            <SelectValue placeholder="Todas as disciplinas" />
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

      {/* Main calendar view */}
      {view === "mes" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <MonthView
            cursor={cursor}
            events={filteredEvents}
            subjects={subjects}
            weekStartsOn={data.profile.weekStartsOn}
            selected={selected}
            onSelectDay={setSelected}
            onOpenDay={(d) => {
              setSelected(d);
              setCursor(d);
              setView("dia");
            }}
            onOpenEvent={handleOpenEvent}
          />

          <aside className="flex flex-col divide-y self-start rounded-xl bg-rail ring-1 ring-border">
            <section className="p-4 sm:p-5">
              <SectionHeader
                title="Dia selecionado"
                action={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSessionDialog({
                        open: true,
                        defaults: { start: selectedIsoAt(19, 0) },
                      })
                    }
                  >
                    <Plus /> Estudo
                  </Button>
                }
              />
              <div className="mt-3">
                <AgendaList
                  days={[startOfDay(selected)]}
                  events={filteredEvents}
                  subjects={subjects}
                  onOpenEvent={handleOpenEvent}
                  emptyLabel="Nenhum compromisso neste dia."
                />
              </div>
            </section>

            <section className="p-4 sm:p-5">
              <div className="eyebrow mb-3">Resumo do mês</div>
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border bg-card p-2.5">
                  <dt className="text-[11px] text-muted-foreground">Provas</dt>
                  <dd className="mt-0.5 font-mono text-lg font-semibold tabular">{monthExams}</dd>
                </div>
                <div className="rounded-lg border bg-card p-2.5">
                  <dt className="text-[11px] text-muted-foreground">Entregas</dt>
                  <dd className="mt-0.5 font-mono text-lg font-semibold tabular">{monthDeliveries}</dd>
                </div>
                <div className="rounded-lg border bg-card p-2.5">
                  <dt className="text-[11px] text-muted-foreground">Estudos</dt>
                  <dd className="mt-0.5 font-mono text-lg font-semibold tabular">{monthSessions}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      )}

      {view === "semana" && (
        <TimeGrid
          days={weekRange}
          events={filteredEvents}
          subjects={subjects}
          onOpenEvent={handleOpenEvent}
          onOpenDay={(d) => {
            setSelected(d);
            setCursor(d);
            setView("dia");
          }}
        />
      )}

      {view === "dia" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <TimeGrid
            days={[startOfDay(cursor)]}
            events={filteredEvents}
            subjects={subjects}
            onOpenEvent={handleOpenEvent}
          />
          <aside className="self-start rounded-xl bg-rail p-4 ring-1 ring-border sm:p-5">
            <SectionHeader title="Lista do dia" meta={fmt(cursor, "dd/MM")} />
            <div className="mt-3">
              <AgendaList
                days={[startOfDay(cursor)]}
                events={filteredEvents}
                subjects={subjects}
                onOpenEvent={handleOpenEvent}
              />
            </div>
          </aside>
        </div>
      )}

      {view === "agenda" && (
        <div className="surface p-4 sm:p-6">
          <AgendaList
            days={agendaRange}
            events={filteredEvents}
            subjects={subjects}
            onOpenEvent={handleOpenEvent}
            emptyLabel="Sem atividades programadas."
          />
        </div>
      )}

      <ExamFormDialog
        open={examDialog.open}
        exam={examDialog.exam}
        onOpenChange={(open) => setExamDialog((d) => ({ ...d, open }))}
      />
      <SessionFormDialog
        state={sessionDialog}
        onOpenChange={(open) => setSessionDialog((s) => ({ ...s, open }))}
      />
    </div>
  );
}
