import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/common/Field";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { SubjectDot } from "@/components/common/SubjectTag";
import { actions, useStudora } from "@/lib/data/store";
import { fileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mode = "arquivo" | "link";

export function MaterialFormDialog({
  open,
  onOpenChange,
  defaultSubjectId,
  initialFile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubjectId?: string;
  initialFile?: File | null;
}) {
  const subjects = useStudora((s) => s.subjects);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("arquivo");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubjectId(defaultSubjectId || subjects[0]?.id || "");
    setDescription("");
    setError(undefined);
    if (initialFile) {
      setMode("arquivo");
      setFile(initialFile);
      setName(initialFile.name);
      setUrl("");
    } else {
      setFile(null);
      setName("");
      setUrl("");
    }
  }, [open, defaultSubjectId, initialFile, subjects]);

  function handleSelectFile(f: File | null) {
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) {
      setError("O limite por arquivo é de 25 MB.");
      return;
    }
    setFile(f);
    if (!name.trim()) setName(f.name);
    setError(undefined);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (mode === "arquivo") {
      if (!file) {
        setError("Selecione um arquivo do seu computador.");
        return;
      }
      setSubmitting(true);
      try {
        await actions.uploadMaterialFile(file, {
          name: name.trim() || file.name,
          subjectId,
          description: description.trim() || undefined,
        });
        toast.success("Material adicionado", { description: name.trim() || file.name });
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao salvar o arquivo.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!name.trim()) {
      setError("Dê um título para o link.");
      return;
    }
    const cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      setError("Informe uma URL válida começando com http:// ou https://.");
      return;
    }

    actions.addMaterial({
      name: name.trim(),
      type: "link",
      subjectId,
      addedAt: new Date().toISOString(),
      sizeKb: 0,
      url: cleanUrl,
      description: description.trim() || undefined,
    });
    toast.success("Link adicionado", { description: name.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar material</DialogTitle>
          <DialogDescription>
            Guarde apostilas, slides, listas em PDF ou links de referência organizados por disciplina.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          <SegmentedControl
            value={mode}
            onChange={(m) => {
              setMode(m);
              setError(undefined);
            }}
            aria-label="Tipo de material"
            className="w-full [&>button]:flex-1"
            options={[
              { value: "arquivo", label: "Arquivo", icon: <Upload /> },
              { value: "link", label: "Link externo", icon: <Link2 /> },
            ]}
          />

          {mode === "arquivo" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg,.webp"
                onChange={(e) => handleSelectFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleSelectFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition-colors hover:bg-accent/50 focus-ring",
                  file ? "border-primary/50 bg-primary-soft/30" : "border-border-strong",
                )}
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                {file ? (
                  <>
                    <span className="max-w-full truncate text-[13.5px] font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground tabular">
                      {fileSize(Math.max(1, Math.round(file.size / 1024)))} · clique para trocar
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[13.5px] font-medium">Clique para escolher ou arraste um arquivo</span>
                    <span className="text-xs text-muted-foreground">
                      PDF, Word, Slides, Planilhas ou Imagens até 25 MB
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <Field label="URL" htmlFor="material-url">
              <Input
                id="material-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(undefined);
                }}
                placeholder="https://..."
                autoFocus
              />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título de exibição" htmlFor="material-name">
              <Input
                id="material-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(undefined);
                }}
                placeholder={mode === "link" ? "Ex.: Visualizador de Grafos" : "Nome do arquivo"}
              />
            </Field>

            <Field label="Disciplina">
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <SubjectDot subject={s} />
                        {s.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Observação (opcional)" htmlFor="material-desc" error={error}>
            <Textarea
              id="material-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Capítulos 4 e 5 caem na P2"
            />
          </Field>

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando…" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
