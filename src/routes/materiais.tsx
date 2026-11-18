import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader } from "@/components/common/PageHeader";
import { SubjectDot } from "@/components/common/SubjectTag";
import { TYPE_LABEL } from "@/components/materials/FileIcon";
import { MaterialFormDialog } from "@/components/materials/MaterialFormDialog";
import { MaterialRow } from "@/components/materials/MaterialRow";
import { subjectMap } from "@/lib/data/selectors";
import { useStudora } from "@/lib/data/store";
import type { MaterialType } from "@/lib/data/types";
import { fileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/materiais")({
  head: () => ({
    meta: [
      { title: "Materiais — Studora" },
      {
        name: "description",
        content: "Biblioteca acadêmica com apostilas, slides, listas em PDF, planilhas e links por disciplina.",
      },
      { property: "og:title", content: "Materiais — Studora" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MaterialsPage,
});

type TypeFilter = "todos" | MaterialType;

function MaterialsPage() {
  const data = useStudora((s) => s);
  const subjects = useMemo(() => subjectMap(data), [data]);

  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("todas");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...data.materials]
      .filter((m) => {
        if (subjectFilter !== "todas" && m.subjectId !== subjectFilter) return false;
        if (typeFilter !== "todos" && m.type !== typeFilter) return false;
        if (q) {
          const sName = subjects[m.subjectId]?.name.toLowerCase() ?? "";
          const match =
            m.name.toLowerCase().includes(q) ||
            (m.description?.toLowerCase().includes(q) ?? false) ||
            sName.includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));
  }, [data.materials, query, subjectFilter, typeFilter, subjects]);

  const totalSizeKb = useMemo(
    () => data.materials.reduce((acc, m) => acc + (m.sizeKb || 0), 0),
    [data.materials],
  );

  return (
    <div
      className="animate-rise"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) {
          setDroppedFile(f);
          setDialogOpen(true);
        }
      }}
    >
      <PageHeader
        eyebrow={`${data.materials.length} itens · ${fileSize(totalSizeKb)} armazenados`}
        title="Materiais"
        description="Apostilas, slides de aula, listas de exercícios e links úteis organizados por disciplina."
        actions={
          <Button
            onClick={() => {
              setDroppedFile(null);
              setDialogOpen(true);
            }}
          >
            <Plus /> Adicionar material
          </Button>
        }
      />

      {/* Quick drop bar */}
      <div
        className={cn(
          "mb-5 flex items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3 text-[13px] transition-colors",
          dragging
            ? "border-primary bg-primary-soft/50 text-primary"
            : "border-border-strong bg-card/60 text-muted-foreground",
        )}
      >
        <span className="flex items-center gap-2.5">
          <Upload className="h-4 w-4 shrink-0" />
          <span>Arraste PDFs, slides ou imagens para esta página para enviar rapidamente.</span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => {
            setDroppedFile(null);
            setDialogOpen(true);
          }}
        >
          Escolher arquivo
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar material ou disciplina…"
            className="h-9 bg-card pl-9"
          />
        </div>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="h-9 w-full bg-card text-[13px] sm:w-56">
            <SelectValue placeholder="Todas as disciplinas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as disciplinas</SelectItem>
            {data.subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <SubjectDot subject={s} />
                  {s.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type chips */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setTypeFilter("todos")}
          className={cn(
            "h-7 rounded-full border px-3 text-[12px] font-medium transition-colors focus-ring",
            typeFilter === "todos"
              ? "border-foreground bg-foreground text-background"
              : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          Todos
        </button>
        {(Object.keys(TYPE_LABEL) as MaterialType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={cn(
              "h-7 rounded-full border px-3 text-[12px] font-medium transition-colors focus-ring",
              typeFilter === t
                ? "border-foreground bg-foreground text-background"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Materials table */}
      <section className="surface overflow-hidden">
        <div className="hidden grid-cols-[auto_minmax(0,1fr)_11rem_6.5rem_5.5rem_auto] items-center gap-4 border-b bg-muted/50 px-5 py-2 sm:grid">
          <span className="w-8" />
          <span className="eyebrow">Material</span>
          <span className="eyebrow">Disciplina</span>
          <span className="eyebrow">Formato</span>
          <span className="eyebrow text-right">Data</span>
          <span className="w-8" />
        </div>

        {filtered.length > 0 ? (
          <ul className="divide-y">
            {filtered.map((m) => (
              <MaterialRow key={m.id} material={m} subject={subjects[m.subjectId]} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<FolderOpen />}
            title="Nenhum material encontrado"
            description={
              query || subjectFilter !== "todas" || typeFilter !== "todos"
                ? "Tente limpar os filtros de busca para ver toda a biblioteca."
                : "Adicione seus primeiros PDFs, resumos ou links de referência."
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (query || subjectFilter !== "todas" || typeFilter !== "todos") {
                    setQuery("");
                    setSubjectFilter("todas");
                    setTypeFilter("todos");
                  } else {
                    setDialogOpen(true);
                  }
                }}
              >
                {query || subjectFilter !== "todas" || typeFilter !== "todos"
                  ? "Limpar filtros"
                  : "Adicionar material"}
              </Button>
            }
          />
        )}
      </section>

      <MaterialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultSubjectId={subjectFilter !== "todas" ? subjectFilter : undefined}
        initialFile={droppedFile}
      />
    </div>
  );
}
