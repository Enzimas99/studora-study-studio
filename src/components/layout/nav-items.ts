import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  GraduationCap,
  LayoutGrid,
  Timer,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  short: string;
  to:
    | "/"
    | "/disciplinas"
    | "/atividades"
    | "/provas"
    | "/calendario"
    | "/planejamento"
    | "/materiais";
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Visão geral", short: "Início", to: "/", icon: LayoutGrid },
  { title: "Disciplinas", short: "Disciplinas", to: "/disciplinas", icon: BookOpen },
  { title: "Trabalhos e atividades", short: "Atividades", to: "/atividades", icon: CheckSquare },
  { title: "Provas e notas", short: "Provas", to: "/provas", icon: GraduationCap },
  { title: "Calendário", short: "Calendário", to: "/calendario", icon: CalendarDays },
  { title: "Planejamento de estudos", short: "Estudos", to: "/planejamento", icon: Timer },
  { title: "Materiais", short: "Materiais", to: "/materiais", icon: FolderOpen },
];

export function isActivePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
