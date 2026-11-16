import { format, isToday, isTomorrow, isYesterday, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const fmt = (d: Date | string, pattern: string) =>
  format(typeof d === "string" ? new Date(d) : d, pattern, { locale: ptBR });

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Hoje", "Amanhã", "Ontem", "Qui, 19 nov" */
export function relativeDay(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "Amanhã";
  if (isYesterday(d)) return "Ontem";
  return capitalize(fmt(d, "EEE, d MMM").replace(".", ""));
}

export function dueLabel(iso: string, now = new Date()) {
  const diff = differenceInCalendarDays(new Date(iso), now);
  if (diff < 0) return `Atrasado ${Math.abs(diff)}d`;
  if (diff === 0) return `Hoje, ${fmt(iso, "HH:mm")}`;
  if (diff === 1) return `Amanhã, ${fmt(iso, "HH:mm")}`;
  if (diff < 7) return capitalize(fmt(iso, "EEEE")).replace("-feira", "");
  return fmt(iso, "d MMM").replace(".", "");
}

export function duration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m.toString().padStart(2, "0")}` : `${h}h`;
}

export function hours(min: number) {
  return (min / 60).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export function grade(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function fileSize(kb: number) {
  if (!kb) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** yyyy-MM-ddTHH:mm for <input type="datetime-local"> */
export const toLocalInput = (iso: string) => fmt(iso, "yyyy-MM-dd'T'HH:mm");
