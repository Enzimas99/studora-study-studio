import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field } from "@/components/common/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authActions, useBackendStatus } from "@/lib/data/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Studora" },
      { name: "description", content: "Acesse seu painel acadêmico no Studora." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { isSupabaseConfigured } = useBackendStatus();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (!email.trim() || !password) {
      setError("Preencha seu e-mail e sua senha.");
      return;
    }
    setLoading(true);
    try {
      await authActions.signIn(email.trim(), password);
      toast.success("Bem-vindo de volta!");
      await navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Credenciais inválidas. Verifique e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Acesso à conta"
      title="Bem-vindo de volta."
      description="Entre com seu e-mail acadêmico para abrir seu semestre."
      footer={
        <>
          Ainda não tem uma conta?{" "}
          <Link to="/cadastro" className="font-medium text-foreground underline underline-offset-4">
            Criar conta gratuita
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <Field label="E-mail" htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            placeholder="voce@universidade.edu.br"
          />
        </Field>

        <Field
          label="Senha"
          htmlFor="login-password"
          error={error}
          hint={
            <Link
              to="/recuperar-senha"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Esqueceu a senha?
            </Link>
          }
        >
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(undefined);
            }}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? "Entrando…" : "Entrar"}
        </Button>

        <div className="relative my-1 flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-border" />
          <span className="relative bg-card px-2.5 text-[11px] uppercase tracking-wider text-subtle">
            ou
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            toast("Modo demonstração aberto");
            void navigate({ to: "/" });
          }}
        >
          Explorar painel de demonstração <ArrowRight />
        </Button>

        {!isSupabaseConfigured && (
          <p className="text-center text-[11.5px] text-muted-foreground">
            Ambiente em modo local — qualquer acesso abre seus dados salvos neste navegador.
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
