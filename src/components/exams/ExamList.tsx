import { SubjectTag } from "@/components/common/SubjectTag";
import { PrepMeter } from "@/components/common/PrepMeter";
import type { Exam, Subject } from "@/lib/data/types";
import { daysUntil } from "@/lib/data/selectors";
import { capitalize, fmt, grade } from "@/lib/format";
import { cn } from "@/lib/utils";

export function gradeTone(g: number) {
  if (g >= 7) return "text-success";
  if (g >= 6) return "text-warning-ink";
  return "text-destructive";
}

export function DateBlock({ iso, highlight }: { iso: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-12 shrink-0 flex-col items-center justify-center rounded-md border py-1.5 leading-none",
        highlight && "border-warning/40 bg-warning-soft",
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {fmt(iso, "MMM").replace(".", "")}
      </span>
      <span className="mt-1 text-[18px] font-semibold tabular">{fmt(iso, "dd")}</span>
    </div>
  );
}

export function UpcomingExamRow({
  exam,
  subject,
  onClick,
  showSubject = true,
}: {
  exam: Exam;
  subject?: Subject;
  onClick?: () => void;
  showSubject?: boolean;
}) {
  const d = daysUntil(exam.date);
  return (
    <li
      onClick={onClick}
      className={cn("flex gap-4 px-4 py-4 sm:px-5", onClick && "cursor-pointer transition-colors hover:bg-accent/50")}
    >
      <DateBlock iso={exam.date} highlight={d <= 3} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {showSubject && <SubjectTag subject={subject} />}
          <span className="text-[12px] text-muted-foreground">
            {capitalize(fmt(exam.date, "EEEE, HH:mm"))}
            {exam.location ? ` · ${exam.location}` : ""}
          </span>
        </div>
        <p className="mt-1 text-[14px] font-medium">{exam.title}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {exam.topics.map((t) => (
            <span key={t} className="rounded-[4px] border px-1.5 text-[11.5px] leading-5 text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="hidden shrink-0 flex-col items-end justify-between gap-2 sm:flex">
        <span className={cn("text-[12.5px] font-medium tabular", d <= 3 ? "text-warning-ink" : "text-muted-foreground")}>
          {d === 0 ? "Hoje" : d === 1 ? "Amanhã" : `Em ${d} dias`}
        </span>
        <PrepMeter value={exam.preparation} />
        <span className="text-[11.5px] text-subtle">Peso {exam.weight}%</span>
      </div>
    </li>
  );
}
