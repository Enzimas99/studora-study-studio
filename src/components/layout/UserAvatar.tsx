import avatar from "@/assets/avatar-marina.jpg";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted", className)}>
      <img src={avatar} alt={name} width={64} height={64} className="h-full w-full object-cover" />
      <span className="sr-only">{initials(name)}</span>
    </span>
  );
}
