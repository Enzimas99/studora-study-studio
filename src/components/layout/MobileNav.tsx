import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, CheckSquare, LayoutGrid, Menu, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { isActivePath, NAV_ITEMS } from "./nav-items";
import { SidebarNav, SidebarUser } from "./Sidebar";
import { useQuickActions } from "./quick-actions";

const TABS = [
  { to: "/", label: "Início", icon: LayoutGrid },
  { to: "/atividades", label: "Atividades", icon: CheckSquare },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { openTask } = useQuickActions();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inTabs = TABS.some((t) => isActivePath(pathname, t.to));
  const otherActive = !inTabs && NAV_ITEMS.some((n) => isActivePath(pathname, n.to));

  const tab = (t: (typeof TABS)[number]) => {
    const active = isActivePath(pathname, t.to);
    return (
      <Link
        key={t.to}
        to={t.to}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <t.icon className={cn("h-[19px] w-[19px]", active && "text-primary")} strokeWidth={1.75} />
        {t.label}
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Navegação"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex h-16 max-w-md items-stretch px-2">
          {tab(TABS[0])}
          {tab(TABS[1])}
          <div className="flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={() => openTask()}
              aria-label="Nova atividade"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-cta text-cta-foreground shadow-md transition-transform active:scale-95 focus-ring"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {tab(TABS[2])}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors",
              otherActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Menu className={cn("h-[19px] w-[19px]", otherActive && "text-primary")} strokeWidth={1.75} />
            Menu
          </button>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex w-[84%] max-w-[300px] flex-col gap-0 border-ink-border bg-ink p-3 text-ink-foreground [&>button:last-child]:text-ink-muted"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-12 items-center pl-2.5">
            <Logo />
          </div>
          <div className="scrollbar-thin -mx-3 flex-1 overflow-y-auto px-3 pt-3 pb-4">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
          <SidebarUser onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
