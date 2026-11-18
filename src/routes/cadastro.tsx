import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field } from "@/components/common/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authActions } from "@/lib/data/store";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Studora" },
      { name: "description", content: "Crie sua conta gratuita no Studora e organize seu semestre." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [period, setPeriod] = useState("1º período");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (!name.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!email.trim()) {
      setError("Informe um endereço de e-mail válido.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await authActions.signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        course: course.trim() || undefined,
        period: period.trim() || undefined,
      });
      if (res.needsConfirmation) {
        toast.success("Conta criada! Verifique seu e-mail para confirmar o acesso.");
        await navigate({ to: "/login" });
      } else {
        toast.success(`Bem-vindo ao Studora, ${name.trim().split(" ")[0]}!`);
        await navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Novo estudante"
      title="Comece seu semestre."
      description="Configure seu perfil acadêmico em menos de um minuto."
      footer={
        <>
          Já possui cadastro?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Fazer login
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Nome completo" htmlFor="signup-name">
          <Input
            id="signup-name"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
            placeholder="Ex.: Enzo Tavares"
          />
        </Field>

        <Field label="E-mail" htmlFor="signup-email">
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            placeholder="voce@universidade.edu.br"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_8.5rem]">
          <Field label="Curso (opcional)" htmlFor="signup-course">
            <Input
              id="signup-course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Ex.: Ciência da Computação"
            />
          </Field>
          <Field label="Período" htmlFor="signup-period">
            <Input
              id="signup-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="3º período"
            />
          </Field>
        </div>

        <Field
          label="Senha"
          htmlFor="signup-password"
          error={error}
          hint={<span className="text-xs text-muted-foreground">Mín. 8 caracteres</span>}
        >
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(undefined);
            }}
            placeholder="Crie uma senha segura"
          />
        </Field>

        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? "Criando conta…" : "Criar minha conta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
