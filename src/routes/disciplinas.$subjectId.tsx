import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/disciplinas/$subjectId")({
  component: () => <div>Em breve</div>,
});
