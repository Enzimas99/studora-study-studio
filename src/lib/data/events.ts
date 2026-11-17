import { addMinutes } from "date-fns";
import type { StudoraData } from "./types";

export type EventKind = "prova" | "entrega" | "estudo" | "aula";

export interface CalendarEvent {
  id: string;
  kind: EventKind;
  title: string;
  subjectId: string;
  start: Date;
  end: Date;
  refId: string;
  meta?: string;
  done?: boolean;
}

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  prova: "Prova",
  entrega: "Entrega",
  estudo: "Estudo",
  aula: "Aula",
};

/** Derives calendar events from exams, task deadlines and study sessions. */
export function buildEvents(s: StudoraData): CalendarEvent[] {
  const exams = s.exams.map<CalendarEvent>((e) => ({
    id: `ev-${e.id}`,
    kind: "prova",
    title: e.title,
    subjectId: e.subjectId,
    start: new Date(e.date),
    end: addMinutes(new Date(e.date), 110),
    refId: e.id,
    meta: e.location,
    done: e.grade !== null,
  }));
  const tasks = s.tasks.map<CalendarEvent>((t) => ({
    id: `ev-${t.id}`,
    kind: "entrega",
    title: t.title,
    subjectId: t.subjectId,
    start: new Date(t.due),
    end: addMinutes(new Date(t.due), 30),
    refId: t.id,
    done: t.status === "concluido",
  }));
  const sessions = s.sessions.map<CalendarEvent>((x) => ({
    id: `ev-${x.id}`,
    kind: "estudo",
    title: x.topic,
    subjectId: x.subjectId,
    start: new Date(x.start),
    end: addMinutes(new Date(x.start), x.durationMin),
    refId: x.id,
    done: x.status === "concluida",
  }));
  return [...exams, ...tasks, ...sessions].sort((a, b) => +a.start - +b.start);
}
