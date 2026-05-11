import type { UserRole } from "@prisma/client";

type UserLike = { id: string; role: UserRole };
type PostLike = { creatorId: string };
type SquadLike = { ownerId: string };

export function isOwner(user: UserLike): boolean {
  return user.role === "OWNER" as UserRole;
}

export function isAdmin(user: UserLike): boolean {
  return user.role === "ADMIN" || isOwner(user);
}

export function isModerator(user: UserLike): boolean {
  return user.role === "MODERATOR" || isAdmin(user);
}

export function canEditLfgPost(user: UserLike, post: PostLike): boolean {
  return post.creatorId === user.id || isModerator(user);
}

export function canDeleteLfgPost(user: UserLike, post: PostLike): boolean {
  return post.creatorId === user.id || isAdmin(user);
}

export function canManageSquad(
  user: UserLike,
  squad: SquadLike,
  memberRole?: string,
): boolean {
  if (squad.ownerId === user.id) return true;
  if (isModerator(user)) return true;
  if (memberRole && ["owner", "admin", "officer"].includes(memberRole)) return true;
  return false;
}

export function canAccessAdmin(user: UserLike): boolean {
  return isModerator(user);
}

export function canTakeModerationAction(user: UserLike): boolean {
  return isModerator(user);
}

export function canManageUsers(user: UserLike): boolean {
  return isAdmin(user);
}

export function canTransferOwnership(user: UserLike, squad: SquadLike): boolean {
  return squad.ownerId === user.id || isOwner(user);
}
