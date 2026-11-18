import avatar from "@/assets/avatar-marina.jpg";
import { useStudora } from "@/lib/data/store";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  const avatarUrl = useStudora((s) => s.profile.avatarUrl);
  const showDefaultPhoto = !avatarUrl && name.trim().toLowerCase().startsWith("marina");
  const src = avatarUrl || (showDefaultPhoto ? avatar : undefined);

  return (
    <span
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-medium text-[11.5px] text-primary",
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} width={64} height={64} className="h-full w-full object-cover" />
      ) : (
        <span>{initials(name) || "ST"}</span>
      )}
    </span>
  );
}
