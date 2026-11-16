import { cn } from "@/lib/utils";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import type { Subject } from "@/lib/data/types";

export function SubjectDot({ subject, className }: { subject?: Subject; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-[3px]",
        subject ? SUBJECT_COLORS[subject.color].dot : "bg-subtle",
        className,
      )}
    />
  );
}

export function SubjectTag({
  subject,
  className,
  short = false,
}: {
  subject?: Subject;
  className?: string;
  short?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground",
        className,
      )}
    >
      <SubjectDot subject={subject} />
      <span className="truncate">{subject ? (short ? subject.code : subject.name) : "Sem disciplina"}</span>
    </span>
  );
}
