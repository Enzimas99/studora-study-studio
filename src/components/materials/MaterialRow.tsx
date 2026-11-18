import { Download, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubjectTag } from "@/components/common/SubjectTag";
import { actions } from "@/lib/data/store";
import type { Material, Subject } from "@/lib/data/types";
import { fileSize, fmt } from "@/lib/format";
import { FileIcon, TYPE_LABEL } from "./FileIcon";

export function MaterialRow({
  material,
  subject,
  showSubject = true,
}: {
  material: Material;
  subject?: Subject;
  showSubject?: boolean;
}) {
  const isLink = material.type === "link";

  function handleOpen() {
    void actions.openOrDownloadMaterial(material).catch((err) => {
      toast.error(err instanceof Error ? err.message : "Não foi possível abrir o material.");
    });
  }

  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 sm:grid-cols-[auto_minmax(0,1fr)_11rem_6.5rem_5.5rem_auto] sm:gap-4 sm:px-5">
      <FileIcon type={material.type} />
      <div className="min-w-0">
        <button
          type="button"
          onClick={handleOpen}
          className="block max-w-full truncate text-left text-[13.5px] font-medium hover:underline focus-ring"
        >
          {material.name}
        </button>
        {material.description && (
          <p className="hidden truncate text-[12px] text-muted-foreground sm:block">
            {material.description}
          </p>
        )}
        <p className="truncate text-[12px] text-muted-foreground sm:hidden">
          {TYPE_LABEL[material.type]} · {fmt(material.addedAt, "d MMM").replace(".", "")}
          {showSubject && subject ? ` · ${subject.name}` : ""}
        </p>
      </div>
      <span className="hidden sm:block">{showSubject && <SubjectTag subject={subject} />}</span>
      <span className="hidden text-[12.5px] text-muted-foreground sm:block">
        {TYPE_LABEL[material.type]}
      </span>
      <span className="hidden text-right text-[12.5px] text-muted-foreground tabular sm:block">
        {fmt(material.addedAt, "dd/MM/yy")}
        <span className="block text-[11px] text-subtle">
          {isLink ? "Externo" : fileSize(material.sizeKb)}
        </span>
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Ações para ${material.name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={handleOpen}>
            {isLink ? (
              <>
                <ExternalLink /> Abrir link
              </>
            ) : (
              <>
                <Download /> Baixar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive-soft focus:text-destructive"
            onSelect={() => {
              actions.deleteMaterial(material.id);
              toast("Material removido", { description: material.name });
            }}
          >
            <Trash2 /> Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
