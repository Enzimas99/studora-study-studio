import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { resolved, setTheme } = useTheme();

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[440px_minmax(0,1fr)] xl:grid-cols-[480px_minmax(0,1fr)]">
      {/* Editorial left panel */}
      <aside className="hidden flex-col justify-between bg-ink p-10 text-ink-foreground lg:flex">
        <div>
          <Link to="/" className="inline-block rounded-md focus-ring">
            <Logo className="text-ink-foreground" />
          </Link>
        </div>

        <div className="max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            Guia acadêmico universitário
          </p>
          <h2 className="mt-3 font-serif text-[38px] leading-[1.08] tracking-[-0.01em] text-ink-foreground">
            Clareza para cada entrega, prova e hora de estudo.
          </h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-muted">
            Reúna disciplinas, avaliações ponderadas, materiais de aula e seu ritmo semanal em um
            ambiente silencioso e sem distrações.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-ink-border pt-6">
            <div>
              <p className="font-mono text-lg font-semibold text-ink-foreground tabular">100%</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">Semestre visível</p>
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-ink-foreground tabular">⌘K</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">Busca instantânea</p>
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-ink-foreground tabular">24/7</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">Acesso sincronizado</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-ink-muted">
          © {new Date().getFullYear()} Studora · Organização acadêmica.
        </p>
      </aside>

      {/* Form canvas */}
      <main className="flex flex-col justify-between px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="rounded-md focus-ring lg:invisible">
            <Logo />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={resolved === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          >
            {resolved === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>

        <div className="mx-auto my-10 w-full max-w-[400px] animate-rise">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="mt-2 font-serif text-[34px] leading-[1.08] tracking-[-0.01em]">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>

          <div className="surface mt-6 p-5 sm:p-6">{children}</div>

          {footer && <div className="mt-5 text-center text-[13px] text-muted-foreground">{footer}</div>}
        </div>

        <div className="text-center text-xs text-subtle lg:invisible">Studora</div>
      </main>
    </div>
  );
}
