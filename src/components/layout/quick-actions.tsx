import { createContext, useContext, useState, type ReactNode } from "react";
import type { Task } from "@/lib/data/types";
import { TaskFormDialog, type TaskDialogState } from "@/components/tasks/TaskFormDialog";

interface QuickActions {
  openTask: (opts?: { task?: Task; defaults?: Partial<Task> }) => void;
  openSearch: () => void;
  searchOpen: boolean;
  setSearchOpen: (o: boolean) => void;
}

const Ctx = createContext<QuickActions | null>(null);

export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [taskState, setTaskState] = useState<TaskDialogState>({ open: false });
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <Ctx.Provider
      value={{
        openTask: (opts) => setTaskState({ open: true, ...opts }),
        openSearch: () => setSearchOpen(true),
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
      <TaskFormDialog
        state={taskState}
        onOpenChange={(open) => setTaskState((s) => ({ ...s, open }))}
      />
    </Ctx.Provider>
  );
}

export function useQuickActions() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuickActions must be used inside QuickActionsProvider");
  return ctx;
}
