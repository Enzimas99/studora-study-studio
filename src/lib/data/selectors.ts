import {
  addDays,
  differenceInCalendarDays,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { Exam, StudoraData, StudySession, Subject, Task } from "./types";

export const subjectMap = (s: StudoraData) =>
  Object.fromEntries(s.subjects.map((x) => [x.id, x])) as Record<string, Subject>;

export const PRIORITY_ORDER = { alta: 0, media: 1, baixa: 2 } as const;

export function openTasks(tasks: Task[]) {
  return tasks
    .filter((t) => t.status !== "concluido")
    .sort((a, b) => +new Date(a.due) - +new Date(b.due));
}

/** Priority list: overdue first, then by priority, then by due date. */
export function prioritized(tasks: Task[], now = new Date()) {
  return openTasks(tasks).sort((a, b) => {
    const ao = new Date(a.due) < now ? 0 : 1;
    const bo = new Date(b.due) < now ? 0 : 1;
    if (ao !== bo) return ao - bo;
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;
    return +new Date(a.due) - +new Date(b.due);
  });
}

export function upcomingExams(exams: Exam[], now = new Date()) {
  return exams
    .filter((e) => e.grade === null && new Date(e.date) >= startOfDay(now))
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

export function pastExams(exams: Exam[]) {
  return exams
    .filter((e) => e.grade !== null)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

/** Weighted average of graded exams on a 0–10 scale. */
export function gradeAverage(exams: Exam[]) {
  const graded = exams.filter((e) => e.grade !== null);
  const totalWeight = graded.reduce((a, e) => a + e.weight, 0);
  if (!totalWeight) return null;
  return graded.reduce((a, e) => a + (e.grade ?? 0) * e.weight, 0) / totalWeight;
}

export function weekDays(weekStartsOn: 0 | 1, ref = new Date()) {
  const start = startOfWeek(ref, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Hours of completed study per day of the current week. */
export function weeklyHours(sessions: StudySession[], weekStartsOn: 0 | 1, ref = new Date()) {
  return weekDays(weekStartsOn, ref).map((day) => {
    const done = sessions
      .filter((s) => s.status === "concluida" && isSameDay(new Date(s.start), day))
      .reduce((a, s) => a + s.durationMin, 0);
    const planned = sessions
      .filter((s) => s.status === "planejada" && isSameDay(new Date(s.start), day))
      .reduce((a, s) => a + s.durationMin, 0);
    return { day, doneMin: done, plannedMin: planned };
  });
}

export function daysUntil(iso: string, now = new Date()) {
  return differenceInCalendarDays(new Date(iso), now);
}
