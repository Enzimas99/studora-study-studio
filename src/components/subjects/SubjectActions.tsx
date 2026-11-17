import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { actions } from "@/lib/data/store";
import type { Subject } from "@/lib/data/types";
import { SubjectFormDialog } from "./SubjectFormDialog";

export function SubjectActions({ subject, showView = true, afterDelete }: { subject: Subject; showView?: boolean; afterDelete?: () => void }) {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Ações para ${subject.name}`} onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
          {showView && (
            <DropdownMenuItem onSelect={() => navigate({ to: "/disciplinas/$subjectId", params: { subjectId: subject.id } })}>
              <Eye /> Visualizar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setEdit(true)}>
            <Pencil /> Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDel(true)} className="text-destructive focus:bg-destructive-soft focus:text-destructive">
            <Trash2 /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SubjectFormDialog open={edit} onOpenChange={setEdit} subject={subject} />
      <ConfirmDialog
        open={del}
        onOpenChange={setDel}
        title={`Excluir ${subject.name}?`}
        description="As atividades, provas, sessões de estudo e materiais desta disciplina também serão removidos."
        onConfirm={() => {
          actions.deleteSubject(subject.id);
          toast("Disciplina excluída", { description: subject.name });
          afterDelete?.();
        }}
      />
    </>
  );
}
