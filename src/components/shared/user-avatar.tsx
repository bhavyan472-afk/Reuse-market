import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  src,
  className,
}: {
  name: string | null | undefined;
  src: string | null | undefined;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-9", className)}>
      {src ? <AvatarImage src={src} alt={name ? `${name}'s avatar` : "Avatar"} /> : null}
      <AvatarFallback className="bg-green-tint text-[0.85em] font-semibold text-primary">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
