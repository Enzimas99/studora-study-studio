import { FileImage, FileSpreadsheet, FileText, Link2, Presentation, File as FileGeneric } from "lucide-react";
import type { MaterialType } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const TYPE_LABEL: Record<MaterialType, string> = {
  pdf: "PDF",
  doc: "Documento",
  slides: "Apresentação",
  planilha: "Planilha",
  imagem: "Imagem",
  link: "Link",
};

const ICONS = { pdf: FileText, doc: FileText, slides: Presentation, planilha: FileSpreadsheet, imagem: FileImage, link: Link2 };
const TONE: Record<MaterialType, string> = {
  pdf: "text-destructive",
  doc: "text-primary",
  slides: "text-subject-coral",
  planilha: "text-success",
  imagem: "text-subject-plum",
  link: "text-muted-foreground",
};

export function FileIcon({ type, className }: { type: MaterialType; className?: string }) {
  const Icon = ICONS[type] ?? FileGeneric;
  return (
    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-card", className)}>
      <Icon className={cn("h-4 w-4", TONE[type])} strokeWidth={1.75} />
    </span>
  );
}

export function typeFromName(name: string): MaterialType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "txt", "md", "odt"].includes(ext)) return "doc";
  if (["ppt", "pptx", "key", "odp"].includes(ext)) return "slides";
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "planilha";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "imagem";
  return "doc";
}
