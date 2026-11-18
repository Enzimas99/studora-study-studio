import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Cloud,
  Database,
  Download,
  LogOut,
  RotateCcw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Field } from "@/components/common/Field";
import { PageHeader, SectionHeader } from "@/components/common/PageHeader";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { actions, authActions, useBackendStatus, useStudora } from "@/lib/data/store";
import { hours } from "@/lib/format";
import { useTheme, type ThemePref } from "@/lib/theme";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil e configurações — Studora" },
      {
        name: "description",
        content: "Gerencie seus dados acadêmicos, metas de estudo, aparência, notificações e backup.",
      },
      { property: "og:title", content: "Perfil e configurações — Studora" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const data = useStudora((s) => s);
  const { profile } = data;
  const backend = useBackendStatus();
  const { pref: themePref, setTheme } = useTheme();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [university, setUniversity] = useState(profile.university);
  const [course, setCourse] = useState(profile.course);
  const [period, setPeriod] = useState(profile.period);
  const [studentId, setStudentId] = useState(profile.studentId);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setUniversity(profile.university);
    setCourse(profile.course);
    setPeriod(profile.period);
    setStudentId(profile.studentId);
  }, [profile]);

  function saveAcademicInfo(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o seu nome.");
      return;
    }
    actions.updateProfile({
      name: name.trim(),
      email: email.trim(),
      university: university.trim(),
      course: course.trim(),
      period: period.trim(),
      studentId: studentId.trim(),
    });
    toast.success("Perfil acadêmico atualizado");
  }

  function handleAvatarChange(file: File | null) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Escolha uma imagem de até 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      actions.updateProfile({ avatarUrl: String(reader.result) });
      toast.success("Foto de perfil atualizada");
    };
    reader.readAsDataURL(file);
  }

  function handleExportBackup() {
    const json = actions.exportBackup();
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast.success("Backup exportado com sucesso");
  }

  function handleImportBackup(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        actions.importBackup(String(reader.result));
        toast.success("Dados restaurados a partir do backup!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Arquivo de backup inválido.");
      }
    };
    reader.readAsText(file);
  }

  const totalWorkload = data.subjects.reduce((acc, s) => acc + s.workload, 0);
  const completedTasks = data.tasks.filter((t) => t.status === "concluido").length;
  const totalStudiedMin = data.sessions
    .filter((s) => s.status === "concluida")
    .reduce((acc, s) => acc + s.durationMin, 0);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Conta e preferências"
        title="Perfil e configurações"
        description="Personalize seus dados universitários, rotina semanal, aparência e sincronização."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Academic profile */}
          <form onSubmit={saveAcademicInfo} className="surface p-4 sm:p-6">
            <SectionHeader title="Dados acadêmicos" />

            <div className="mt-4 flex flex-wrap items-center gap-4 border-b pb-5">
              <UserAvatar name={profile.name} className="h-14 w-14 text-base" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{profile.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {profile.course || "Curso não informado"} · {profile.period}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera /> Trocar foto
                </Button>
                {profile.avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.updateProfile({ avatarUrl: undefined })}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" htmlFor="prof-name">
                <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="E-mail acadêmico" htmlFor="prof-email">
                <Input
                  id="prof-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Universidade / Instituição" htmlFor="prof-uni">
                <Input
                  id="prof-uni"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Ex.: UFPR, USP, UNICAMP"
                />
              </Field>
              <Field label="Curso" htmlFor="prof-course">
                <Input
                  id="prof-course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Ex.: Engenharia de Computação"
                />
              </Field>
              <Field label="Período / Semestre" htmlFor="prof-period">
                <Input
                  id="prof-period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Ex.: 5º período"
                />
              </Field>
              <Field label="Matrícula / RA" htmlFor="prof-id">
                <Input
                  id="prof-id"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="font-mono"
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end border-t pt-4">
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>

          {/* Study & appearance preferences */}
          <section className="surface p-4 sm:p-6">
            <SectionHeader title="Rotina e aparência" />

            <div className="mt-5 grid gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">Meta semanal de estudo</span>
                  <span className="font-mono text-[13px] font-semibold text-primary tabular">
                    {profile.weeklyGoalHours} h / semana
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Usada para calcular as barras de progresso no início e no planejamento (~
                  {(profile.weeklyGoalHours / 7).toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  h por dia).
                </p>
                <Slider
                  className="mt-3"
                  min={2}
                  max={40}
                  step={1}
                  value={[profile.weeklyGoalHours]}
                  onValueChange={([val]) => actions.updateProfile({ weeklyGoalHours: val })}
                />
              </div>

              <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                <Field label="Início da semana">
                  <SegmentedControl
                    value={String(profile.weekStartsOn) as "0" | "1"}
                    onChange={(v) =>
                      actions.updateProfile({ weekStartsOn: Number(v) as 0 | 1 })
                    }
                    className="w-full [&>button]:flex-1"
                    options={[
                      { value: "1", label: "Segunda" },
                      { value: "0", label: "Domingo" },
                    ]}
                  />
                </Field>

                <Field label="Tema da interface">
                  <SegmentedControl
                    value={themePref}
                    onChange={(v: ThemePref) => setTheme(v)}
                    className="w-full [&>button]:flex-1"
                    options={[
                      { value: "light", label: "Claro" },
                      { value: "dark", label: "Escuro" },
                      { value: "system", label: "Sistema" },
                    ]}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="surface p-4 sm:p-6">
            <SectionHeader title="Notificações e lembretes" />
            <ul className="mt-4 divide-y">
              {(
                [
                  {
                    key: "deadlines",
                    title: "Prazos de atividades",
                    desc: "Avisar 24 horas antes do vencimento de listas e entregas.",
                  },
                  {
                    key: "exams",
                    title: "Avaliações próximas",
                    desc: "Alertar com 7 e 2 dias de antecedência sobre provas agendadas.",
                  },
                  {
                    key: "studyReminders",
                    title: "Blocos de estudo planejados",
                    desc: "Lembrar no horário de início das sessões do planejamento.",
                  },
                  {
                    key: "weeklyReport",
                    title: "Resumo de domingo",
                    desc: "Balanço semanal das horas estudadas e prioridades da semana seguinte.",
                  },
                  {
                    key: "email",
                    title: "Receber alertas por e-mail",
                    desc: "Enviar cópia dos alertas críticos para seu e-mail acadêmico.",
                  },
                ] as const
              ).map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[13.5px] font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={profile.notifications[item.key]}
                    onCheckedChange={(checked) =>
                      actions.updateProfile({
                        notifications: { ...profile.notifications, [item.key]: checked },
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right rail */}
        <aside className="flex flex-col divide-y self-start rounded-xl bg-rail ring-1 ring-border">
          <section className="p-4 sm:p-5">
            <div className="eyebrow mb-3">Panorama do semestre</div>
            <dl className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border bg-card p-3">
                <dt className="text-[11px] text-muted-foreground">Disciplinas</dt>
                <dd className="mt-0.5 font-mono text-xl font-semibold tabular">
                  {data.subjects.length}
                </dd>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <dt className="text-[11px] text-muted-foreground">Carga horária</dt>
                <dd className="mt-0.5 font-mono text-xl font-semibold tabular">
                  {totalWorkload}h
                </dd>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <dt className="text-[11px] text-muted-foreground">Entregas feitas</dt>
                <dd className="mt-0.5 font-mono text-xl font-semibold tabular">
                  {completedTasks}
                </dd>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <dt className="text-[11px] text-muted-foreground">Estudo total</dt>
                <dd className="mt-0.5 font-mono text-xl font-semibold tabular">
                  {hours(totalStudiedMin)}h
                </dd>
              </div>
            </dl>
          </section>

          <section className="p-4 sm:p-5">
            <SectionHeader title="Sincronização e dados" />
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border bg-card p-3 text-xs">
              {backend.remoteActive ? (
                <>
                  <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div>
                    <p className="font-medium text-foreground">Nuvem ativa (Supabase)</p>
                    <p className="mt-0.5 text-muted-foreground">
                      Seus registros estão sincronizados com sua conta autenticada.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Armazenamento local ativo</p>
                    <p className="mt-0.5 text-muted-foreground">
                      Dados salvos neste navegador. Configure o Supabase para sincronizar na nuvem.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 grid gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleExportBackup}>
                <Download /> Exportar backup (.json)
              </Button>
              <input
                ref={backupInputRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => handleImportBackup(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => backupInputRef.current?.click()}
              >
                <Upload /> Importar backup (.json)
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setResetConfirmOpen(true)}
              >
                <RotateCcw /> Restaurar dados de demonstração
              </Button>
            </div>
          </section>

          <section className="p-4 sm:p-5">
            <Button
              type="button"
              variant="outline"
              className="w-full text-destructive hover:bg-destructive-soft hover:text-destructive"
              onClick={() => {
                void authActions.signOut().finally(() => {
                  toast("Sessão encerrada");
                  navigate({ to: "/login" });
                });
              }}
            >
              <LogOut /> Sair da conta
            </Button>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Restaurar dados de demonstração?"
        description="Isso substituirá as disciplinas, atividades e notas locais pelo semestre de exemplo original."
        confirmLabel="Restaurar"
        onConfirm={() => {
          actions.resetDemo();
          toast.success("Dados de demonstração restaurados");
        }}
      />
    </div>
  );
}
