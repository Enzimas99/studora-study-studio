import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { useStudora } from "@/lib/data/store";
import { ThemeToggle } from "./ThemeToggle";
import { UserAvatar } from "./UserAvatar";
import { useQuickActions } from "./quick-actions";

export function Topbar() {
  const { openSearch, openTask } = useQuickActions();
  const name = useStudora((s) => s.profile.name);
  const onHome = useRouterState({ select: (s) => s.location.pathname === "/" });
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="rounded-md focus-ring lg:hidden" aria-label="Studora — Visão geral">
          <Logo className="text-[23px]" />
        </Link>

        <button
          type="button"
          onClick={openSearch}
          className="hidden h-8 w-full max-w-[320px] items-center gap-2 rounded-md border bg-card px-2.5 text-[13px] text-muted-foreground shadow-xs transition-colors hover:border-border-strong focus-ring sm:flex lg:ml-0"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar…</span>
          <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10.5px] leading-[18px]">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" className="sm:hidden" aria-label="Buscar" onClick={openSearch}>
            <Search />
          </Button>
          <ThemeToggle />
          <Button size="sm" className={onHome ? "hidden" : "hidden sm:inline-flex"} onClick={() => openTask()}>
            <Plus /> Nova atividade
          </Button>
          <Link to="/perfil" className="ml-1 rounded-full focus-ring lg:hidden" aria-label="Perfil">
            <UserAvatar name={name} className="h-7 w-7" />
          </Link>
        </div>
      </div>
    </header>
  );
}
