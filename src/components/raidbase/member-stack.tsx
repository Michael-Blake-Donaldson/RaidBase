import { Avatar } from "@/components/ui/avatar";

type Member = {
  username: string;
  displayName?: string | null;
  avatarSrc?: string | null;
};

type MemberStackProps = {
  members: Member[];
  maxVisible?: number;
  size?: "xs" | "sm" | "md";
};

export function MemberStack({ members, maxVisible = 4, size = "sm" }: MemberStackProps) {
  const visible = members.slice(0, maxVisible);
  const overflow = members.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((member, i) => (
        <div
          key={member.username}
          className="ring-2 ring-white dark:ring-gray-900 rounded-full"
          style={{ marginLeft: i > 0 ? "-0.5rem" : 0 }}
          title={member.displayName ?? member.username}
        >
          <Avatar
            src={member.avatarSrc}
            displayName={member.displayName}
            username={member.username}
            size={size}
          />
        </div>
      ))}
      {overflow > 0 ? (
        <div
          className="rb-surface-soft ring-2 ring-white dark:ring-gray-900 inline-flex h-8 w-8 -ml-2 items-center justify-center rounded-full text-xs font-semibold rb-text-muted"
          title={`${overflow} more`}
        >
          +{overflow}
        </div>
      ) : null}
    </div>
  );
}
