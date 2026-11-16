import { useEffect, useState, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { CommandMenu } from "./CommandMenu";
import { QuickActionsProvider } from "./quick-actions";

const COLLAPSE_KEY = "studora:sidebar-collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(COLLAPSE_KEY) === "1");
  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <TooltipProvider delayDuration={300}>
      <QuickActionsProvider>
        <div className="flex min-h-dvh w-full">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pt-8 lg:px-10 lg:pb-16">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
        <CommandMenu />
      </QuickActionsProvider>
    </TooltipProvider>
  );
}
