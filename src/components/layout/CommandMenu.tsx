import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SubjectDot } from "@/components/common/SubjectTag";
import { StatusIcon } from "@/components/common/TaskMeta";
import { useStudora } from "@/lib/data/store";
import { NAV_ITEMS } from "./nav-items";
import { useQuickActions } from "./quick-actions";

export function CommandMenu() {
  const { searchOpen, setSearchOpen, openTask } = useQuickActions();
  const navigate = useNavigate();
  const subjects = useStudora((s) => s.subjects);
  const tasks = useStudora((s) => s.tasks);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const run = (fn: () => void) => {
    setSearchOpen(false);
    fn();
  };

  return (
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
      <CommandInput placeholder="Buscar páginas, disciplinas e atividades…" />
      <CommandList className="max-h-[min(60vh,420px)] pb-2">
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => run(() => openTask())}>
            <Plus /> Nova atividade
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/perfil" }))}>
            <Settings /> Perfil e configurações
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Páginas">
          {NAV_ITEMS.map((n) => (
            <CommandItem key={n.to} onSelect={() => run(() => navigate({ to: n.to }))}>
              <n.icon /> {n.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Disciplinas">
          {subjects.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.name} ${s.code} ${s.professor}`}
              onSelect={() => run(() => navigate({ to: "/disciplinas/$subjectId", params: { subjectId: s.id } }))}
            >
              <span className="flex w-4 justify-center">
                <SubjectDot subject={s} />
              </span>
              {s.name}
              <span className="ml-auto text-xs text-muted-foreground">{s.code}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Atividades">
          {tasks.slice(0, 30).map((t) => (
            <CommandItem key={t.id} value={`${t.title} ${t.id}`} onSelect={() => run(() => openTask({ task: t }))}>
              <StatusIcon status={t.status} />
              <span className="truncate">{t.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
