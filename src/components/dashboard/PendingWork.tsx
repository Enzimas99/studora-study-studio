import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/common/PageHeader";
import { TaskRow } from "@/components/tasks/TaskRow";
import { useStudora } from "@/lib/data/store";
import { openTasks, subjectMap } from "@/lib/data/selectors";

export function PendingWork() {
  const data = useStudora((s) => s);
  const subjects = subjectMap(data);
  const tasks = openTasks(data.tasks).slice(0, 5);
  const total = openTasks(data.tasks).length;

  return (
    <section className="surface flex flex-col">
      <div className="px-4 pt-4 pb-3 sm:px-5">
        <SectionHeader
          title="Trabalhos pendentes"
          meta={total}
          action={
            <Link to="/atividades" className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground">
              Ver <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
      </div>
      <ul className="flex-1 divide-y border-t [&>li]:sm:px-5">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} subject={subjects[t.subjectId]} showSubject={false} dense />
        ))}
      </ul>
    </section>
  );
}
