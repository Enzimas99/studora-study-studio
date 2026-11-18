import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { authService, isSupabaseConfigured } from "@/backend";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field } from "@/components/common/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authActions } from "@/lib/data/store";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Studora" },
      { name: "description", content: "Redefina sua senha de acesso ao Studora." },
    ],
  }),
  component: RecoverPasswordPage,
});

function RecoverPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setRecoveryMode(true);
    }
    return authService.onAuthChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });
  }, []);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (!email.trim()) {
      setError("Informe o e-mail cadastrado.");
      return;
    }
    setLoading(true);
    try {
      await authActions.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await authActions.updatePassword(newPassword);
      toast.success("Senha atualizada com sucesso!");
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Segurança da conta"
      title={recoveryMode ? "Definir nova senha." : "Recuperar acesso."}
      description={
        recoveryMode
          ? "Escolha uma nova senha para voltar a acessar seu painel."
          : "Enviaremos um link seguro para você criar uma nova senha."
      }
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Voltar para o login
        </Link>
      }
    >
      {recoveryMode ? (
        <form onSubmit={handleUpdatePassword} className="grid gap-4">
          <Field label="Nova senha" htmlFor="new-password" error={error}>
            <Input
              id="new-password"
              type="password"
              autoFocus
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError(undefined);
              }}
              placeholder="Mínimo de 8 caracteres"
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </form>
      ) : sent ? (
        <div className="py-2 text-center">
          <CheckCircle2 className="mx-auto h-9 w-9 text-success" strokeWidth={1.75} />
          <p className="mt-3 text-sm font-medium">Instruções enviadas</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Se houver uma conta vinculada a <span className="font-medium text-foreground">{email}</span>,
            você receberá o link de redefinição em instantes.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => setSent(false)}
          >
            Tentar outro e-mail
          </Button>
        </div>
      ) : (
        <form onSubmit={handleRequest} className="grid gap-4">
          <Field label="E-mail da conta" htmlFor="recover-email" error={error}>
            <Input
              id="recover-email"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(undefined);
              }}
              placeholder="voce@universidade.edu.br"
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando…" : "Enviar link de recuperação"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
