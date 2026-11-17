import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/common/PageHeader";
import { PrepMeter } from "@/components/common/PrepMeter";
import { SubjectDot } from "@/components/common/SubjectTag";
import { useStudora } from "@/lib/data/store";
import { daysUntil, subjectMap, upcomingExams } from "@/lib/data/selectors";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UpcomingExams() {
  const data = useStudora((s) => s);
  const subjects = subjectMap(data);
  const exams = upcomingExams(data.exams).slice(0, 3);

  return (
    <section className="surface flex flex-col">
      <div className="px-4 pt-4 pb-3 sm:px-5">
        <SectionHeader
          title="Próximas provas"
          action={
            <Link to="/provas" className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground">
              Ver <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
      </div>
      <ul className="flex-1 divide-y border-t">
        {exams.map((e) => {
          const d = daysUntil(e.date);
          return (
            <li key={e.id} className="flex gap-4 px-4 py-3.5 sm:px-5">
              <div
                className={cn(
                  "flex w-11 shrink-0 flex-col items-center justify-center rounded-md border py-1.5 leading-none",
                  d <= 3 && "border-warning/40 bg-warning-soft",
                )}
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {fmt(e.date, "MMM").replace(".", "")}
                </span>
                <span className="mt-1 text-[17px] font-semibold tabular">{fmt(e.date, "dd")}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <SubjectDot subject={subjects[e.subjectId]} />
                  <span className="truncate">{subjects[e.subjectId]?.name}</span>
                </div>
                <p className="mt-0.5 truncate text-[13.5px] font-medium">{e.title.split(" — ")[1] ?? e.title}</p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <PrepMeter value={e.preparation} />
                  <span className={cn("text-xs tabular", d <= 3 ? "text-warning-ink" : "text-muted-foreground")}>
                    {d === 0 ? "hoje" : d === 1 ? "amanhã" : `em ${d} dias`}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
