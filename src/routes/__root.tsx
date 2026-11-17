import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  ClientOnly,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { themeBootScript } from "../lib/theme";
import { AppShell } from "../components/layout/AppShell";
import { Logo } from "../components/brand/Logo";
import { Toaster } from "../components/ui/sonner";

const AUTH_PATHS = ["/login", "/cadastro", "/recuperar-senha"];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <Logo />
        <h1 className="mt-8 text-5xl font-semibold tracking-tight text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta página não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-9 items-center justify-center rounded-md bg-cta px-4 text-sm font-medium text-cta-foreground transition-colors hover:bg-cta-hover"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente novamente ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-9 items-center justify-center rounded-md bg-cta px-4 text-sm font-medium text-cta-foreground transition-colors hover:bg-cta-hover"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Studora — Sua vida acadêmica em um só lugar" },
      {
        name: "description",
        content:
          "Disciplinas, trabalhos, provas, calendário e planejamento de estudos organizados em um só lugar.",
      },
      { name: "author", content: "Studora" },
      { property: "og:title", content: "Studora — Sua vida acadêmica em um só lugar" },
      {
        property: "og:description",
        content: "Organização acadêmica para estudantes universitários.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function BootScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background text-foreground/80">
      <Logo className="animate-pulse" />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuth = AUTH_PATHS.includes(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      {/* The app runs from browser-stored demo data, so it renders after hydration. */}
      <ClientOnly fallback={<BootScreen />}>
        {/* Required: nested routes render here. */}
        {isAuth ? (
          <Outlet />
        ) : (
          <AppShell>
            <Outlet />
          </AppShell>
        )}
        <Toaster position="bottom-right" />
      </ClientOnly>
    </QueryClientProvider>
  );
}
