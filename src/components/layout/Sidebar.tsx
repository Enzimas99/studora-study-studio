import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SubjectDot } from "@/components/common/SubjectTag";
import { authActions, useStudora } from "@/lib/data/store";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "./nav-items";
import { UserAvatar } from "./UserAvatar";

function NavTooltip({ show, label, children }: { show: boolean; label: string; children: React.ReactNode }) {
  if (!show) return <>{children}</>;
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openCount = useStudora((s) => s.tasks.filter((t) => t.status !== "concluido").length);
  const subjects = useStudora((s) => s.subjects);

  return (
    <nav className="flex flex-col gap-6" aria-label="Navegação principal">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.to);
          return (
            <li key={item.to}>
              <NavTooltip show={collapsed} label={item.title}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-9 items-center gap-3 rounded-md px-2.5 text-[13.5px] transition-colors duration-150 focus-ring",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-ink-hover text-ink-foreground"
                      : "text-ink-muted hover:bg-ink-hover/60 hover:text-ink-foreground",
                  )}
                >
                  {active && (
                    <span aria-hidden className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />
                  )}
                  <item.icon
                    className={cn("h-[17px] w-[17px] shrink-0", active ? "text-ink-foreground" : "text-ink-muted group-hover:text-ink-foreground")}
                    strokeWidth={1.75}
                  />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                  {!collapsed && item.to === "/atividades" && openCount > 0 && (
                    <span className="ml-auto font-mono text-[11px] text-ink-muted tabular">{openCount}</span>
                  )}
                </Link>
              </NavTooltip>
            </li>
          );
        })}
      </ul>

      {!collapsed && subjects.length > 0 && (
        <div>
          <div className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted/70">
            Disciplinas
          </div>
          <ul className="flex flex-col gap-0.5">
            {subjects.map((s) => {
              const active = pathname === `/disciplinas/${s.id}`;
              return (
                <li key={s.id}>
                  <Link
                    to="/disciplinas/$subjectId"
                    params={{ subjectId: s.id }}
                    onClick={onNavigate}
                    className={cn(
                      "flex h-8 items-center gap-3 rounded-md px-2.5 text-[13px] transition-colors focus-ring",
                      active ? "bg-ink-hover text-ink-foreground" : "text-ink-muted hover:bg-ink-hover/60 hover:text-ink-foreground",
                    )}
                  >
                    <span className="flex h-[17px] w-[17px] items-center justify-center">
                      <SubjectDot subject={s} />
                    </span>
                    <span className="truncate">{s.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}

export function SidebarUser({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const profile = useStudora((s) => s.profile);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className={cn("flex items-center gap-2.5 border-t border-ink-border pt-3", collapsed && "flex-col")}>
      <Link
        to="/perfil"
        onClick={onNavigate}
        className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1 transition-colors hover:bg-ink-hover/60 focus-ring", collapsed && "flex-none")}
      >
        <UserAvatar name={profile.name} />
        {!collapsed && (
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-medium text-ink-foreground">{profile.name}</span>
            <span className="block truncate text-[11.5px] text-ink-muted">{profile.period}</span>
          </span>
        )}
      </Link>
      <div className={cn("flex items-center", collapsed && "flex-col")}>
        <NavTooltip show label="Configurações">
          <Link
            to="/perfil"
            onClick={onNavigate}
            aria-label="Configurações"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-ink-hover hover:text-ink-foreground focus-ring",
              pathname === "/perfil" ? "text-ink-foreground" : "text-ink-muted",
            )}
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </NavTooltip>
        <NavTooltip show label="Sair">
          <button
            type="button"
            aria-label="Sair"
            onClick={() => {
              void authActions.signOut().finally(() => navigate({ to: "/login" }));
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ink-hover hover:text-ink-foreground focus-ring"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </NavTooltip>
      </div>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col bg-ink px-3 pb-3 text-ink-foreground transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-[64px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex h-16 items-center", collapsed ? "justify-center" : "justify-between pl-2.5")}>
        <Link to="/" aria-label="Studora — Visão geral" className="rounded-md focus-ring">
          <Logo compact={collapsed} />
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Recolher menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ink-hover hover:text-ink-foreground focus-ring"
          >
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
      <div className="scrollbar-thin -mx-3 flex-1 overflow-y-auto px-3 pt-2 pb-4">
        <SidebarNav collapsed={collapsed} />
      </div>
      {collapsed && (
        <NavTooltip show label="Expandir menu">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expandir menu"
            className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ink-hover hover:text-ink-foreground focus-ring"
          >
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </NavTooltip>
      )}
      <SidebarUser collapsed={collapsed} />
    </aside>
  );
}
