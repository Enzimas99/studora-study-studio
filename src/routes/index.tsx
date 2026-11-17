import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { isSameWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { useQuickActions } from "@/components/layout/quick-actions";
import { SummaryStrip } from "@/components/dashboard/SummaryStrip";
import { FocusList } from "@/components/dashboard/FocusList";
import { UpcomingExams } from "@/components/dashboard/UpcomingExams";
import { PendingWork } from "@/components/dashboard/PendingWork";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { AgendaRail } from "@/components/dashboard/AgendaRail";
import { SubjectsOverview } from "@/components/dashboard/SubjectsOverview";
import { useStudora } from "@/lib/data/store";
import { upcomingExams } from "@/lib/data/selectors";
import { capitalize, fmt, greeting } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão geral — Studora" },
      { name: "description", content: "Seu resumo acadêmico: prioridades, provas, entregas e progresso de estudos." },
      { property: "og:title", content: "Visão geral — Studora" },
      { property: "og:description", content: "Prioridades, provas, entregas e progresso de estudos em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { openTask } = useQuickActions();
  const profile = useStudora((s) => s.profile);
  const tasks = useStudora((s) => s.tasks);
  const exams = useStudora((s) => s.exams);
  const now = new Date();
  const firstName = profile.name.split(" ")[0];

  const weekDeliveries = tasks.filter(
    (t) => t.status !== "concluido" && isSameWeek(new Date(t.due), now, { weekStartsOn: profile.weekStartsOn }) && new Date(t.due) >= now,
  ).length;
  const nextExam = upcomingExams(exams)[0];

  return (
    <div className="animate-rise">
      <header className="flex flex-col gap-5 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{capitalize(fmt(now, "EEEE, d 'de' MMMM"))}</p>
          <h1 className="mt-2 font-serif text-[38px] leading-[1.05] tracking-[-0.01em] sm:text-[44px]">
            {greeting(now)}, {firstName}.
          </h1>
          <p className="mt-2 max-w-lg text-[14px] text-muted-foreground">
            {weekDeliveries > 0
              ? `${weekDeliveries} ${weekDeliveries === 1 ? "entrega" : "entregas"} ainda nesta semana`
              : "Nenhuma entrega restante nesta semana"}
            {nextExam && `, e ${nextExam.title.split(" — ")[0]} de ${nextExam.title.includes("—") ? "" : ""}`}
            {nextExam && <SubjectName id={nextExam.subjectId} />}
            {nextExam && ` ${capitalize(fmt(nextExam.date, "EEEE")).replace("-feira", "").toLowerCase() === "" ? "" : `na ${fmt(nextExam.date, "EEEE").replace("-feira", "")}`}`}
            .
          </p>
        </div>
        <Button onClick={() => openTask()} className="self-start sm:self-auto">
          <Plus /> Adicionar atividade
        </Button>
      </header>

      <SummaryStrip />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <FocusList />
          <div className="grid gap-6 md:grid-cols-2">
            <UpcomingExams />
            <PendingWork />
          </div>
        </div>
        <aside className="flex flex-col divide-y self-start rounded-xl bg-rail ring-1 ring-border">
          <WeeklyProgress />
          <AgendaRail />
        </aside>
      </div>

      <div className="mt-6">
        <SubjectsOverview />
      </div>
    </div>
  );
}

function SubjectName({ id }: { id: string }) {
  const name = useStudora((s) => s.subjects.find((x) => x.id === id)?.name);
  return <span className="text-foreground">{name}</span>;
}
