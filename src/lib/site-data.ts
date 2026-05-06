export type NavItem = {
  label: string;
  href: string;
  badge?: string;
};

export type PlayerCard = {
  username: string;
  displayName: string;
  rank: string;
  role: string;
  region: string;
  mic: string;
  synergy: number;
  reputation: string[];
  games: string[];
  tagline: string;
  schedule: string;
};

export type ClipCard = {
  title: string;
  player: string;
  game: string;
  duration: string;
  views: string;
  mood: string;
};

export type LfgCard = {
  id: string;
  title: string;
  game: string;
  region: string;
  rank: string;
  roles: string[];
  schedule: string;
  tone: string;
  micRequired: boolean;
  openSpots: number;
};

export type SquadCard = {
  id: string;
  name: string;
  game: string;
  members: number;
  openRoles: string[];
  synergy: number;
  status: string;
  activity: string;
  privacy: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
  inviteCodeRequired: boolean;
};

export type ReportCard = {
  subject: string;
  reason: string;
  severity: "Low" | "Medium" | "High";
  status: string;
  evidence: string;
};

export type ActionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: "High" | "Medium" | "Low";
};

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  category: "invite" | "trust" | "content" | "billing";
  priority: "High" | "Medium" | "Low";
  createdAt: string;
  resolved?: boolean;
  persisted?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Command", href: "/" },
  { label: "LFG Grid", href: "/lfg", badge: "24" },
  { label: "Squads", href: "/squads", badge: "8" },
  { label: "Clips", href: "/clips" },
  { label: "Settings", href: "/settings" },
  { label: "Admin", href: "/admin", badge: "4" },
];

export const platformStats = [
  { label: "Active LFG posts", value: "184", delta: "+19 today" },
  { label: "Verified profiles", value: "12.4k", delta: "82% complete" },
  { label: "Average trust score", value: "4.7/5", delta: "3 review minimum" },
  { label: "Recurring squads", value: "913", delta: "+11% month over month" },
];

export const recommendedPlayers: PlayerCard[] = [
  {
    username: "ghosttrace",
    displayName: "Ghost Trace",
    rank: "Immortal 2",
    role: "Initiator / IGL",
    region: "NA Central",
    mic: "Required",
    synergy: 92,
    reputation: ["Reliable", "Shotcaller", "Great Comms"],
    games: ["Valorant", "CS2"],
    tagline: "Runs calm mid-round calls and stays composed late in ranked grinds.",
    schedule: "Weeknights 7PM-11PM CT",
  },
  {
    username: "emberraid",
    displayName: "Ember Raid",
    rank: "Mythic Raid Lead",
    role: "Support / Strategist",
    region: "NA East",
    mic: "Preferred",
    synergy: 88,
    reputation: ["Mentor", "Chill", "Prepared"],
    games: ["World of Warcraft", "Destiny 2"],
    tagline: "Builds clean progression groups with notes, accountability, and zero meltdown energy.",
    schedule: "Tue/Thu/Sun 8PM-12AM ET",
  },
  {
    username: "vectorhush",
    displayName: "Vector Hush",
    rank: "Diamond 1",
    role: "Entry / Flex",
    region: "EU West",
    mic: "Required",
    synergy: 85,
    reputation: ["Reliable", "Fast Learner", "No Tilt"],
    games: ["Apex Legends", "Rainbow Six Siege"],
    tagline: "High-pressure opener who still listens, rotates, and reviews mistakes after sessions.",
    schedule: "Daily 6PM-10PM GMT",
  },
];

export const featuredClips: ClipCard[] = [
  {
    title: "4v2 retake with layered utility",
    player: "Ghost Trace",
    game: "Valorant",
    duration: "0:42",
    views: "18.4k",
    mood: "Precision",
  },
  {
    title: "Mythic callout breakdown and clean finish",
    player: "Ember Raid",
    game: "Destiny 2",
    duration: "1:14",
    views: "9.1k",
    mood: "Leadership",
  },
  {
    title: "Final ring reset with instant armor swap",
    player: "Vector Hush",
    game: "Apex Legends",
    duration: "0:31",
    views: "13.7k",
    mood: "Clutch",
  },
];

export const lfgPosts: LfgCard[] = [
  {
    id: "seed-lfg-1",
    title: "Immortal stack for disciplined ranked push",
    game: "Valorant",
    region: "NA Central",
    rank: "Ascendant 3 - Radiant",
    roles: ["Controller", "Sentinel"],
    schedule: "Tonight 8PM-1AM CT",
    tone: "Competitive",
    micRequired: true,
    openSpots: 2,
  },
  {
    id: "seed-lfg-2",
    title: "Late-night Helldivers squad, zero rage",
    game: "Helldivers 2",
    region: "NA East",
    rank: "Difficulty 8-10",
    roles: ["Anti-tank", "Utility"],
    schedule: "Weeknights 10PM-1AM ET",
    tone: "Chill but efficient",
    micRequired: false,
    openSpots: 2,
  },
  {
    id: "seed-lfg-3",
    title: "Fresh Tarkov duo into stable four-stack",
    game: "Escape from Tarkov",
    region: "EU West",
    rank: "Map knowledge preferred",
    roles: ["Scout", "Anchor"],
    schedule: "Fri-Sun 7PM-12AM GMT",
    tone: "Methodical",
    micRequired: true,
    openSpots: 3,
  },
  {
    id: "seed-lfg-4",
    title: "Heroic raid prep with guides and logs",
    game: "World of Warcraft",
    region: "NA East",
    rank: "AOTC track",
    roles: ["Healer", "Ranged DPS"],
    schedule: "Tue/Thu 8PM-11PM ET",
    tone: "Structured",
    micRequired: true,
    openSpots: 4,
  },
];

export const squads: SquadCard[] = [
  {
    id: "seed-squad-1",
    name: "Night Circuit",
    game: "Valorant",
    members: 5,
    openRoles: ["Sentinel"],
    synergy: 94,
    status: "Scrimming now",
    activity: "Won 6 of last 7 ranked sessions",
    privacy: "INVITE_ONLY",
    inviteCodeRequired: true,
  },
  {
    id: "seed-squad-2",
    name: "Orbit Division",
    game: "Destiny 2",
    members: 8,
    openRoles: ["Raid analyst", "Support flex"],
    synergy: 89,
    status: "Recruiting for weekly clears",
    activity: "Three repeat-fireteams formed this week",
    privacy: "PUBLIC",
    inviteCodeRequired: false,
  },
  {
    id: "seed-squad-3",
    name: "Static Echo",
    game: "CS2",
    members: 6,
    openRoles: ["Anchor", "AWP secondary"],
    synergy: 86,
    status: "Reviewing demos",
    activity: "Average attendance 96% over 30 days",
    privacy: "PRIVATE",
    inviteCodeRequired: true,
  },
];

export const moderationQueue: ReportCard[] = [
  {
    subject: "rapidflame",
    reason: "Session toxicity spike",
    severity: "High",
    status: "Auto-held from public comments",
    evidence: "5 negative reviews across 3 verified sessions in 48 hours",
  },
  {
    subject: "boostlink777",
    reason: "Potential impersonation",
    severity: "Medium",
    status: "Pending identity review",
    evidence: "Username similarity and reused clip thumbnails",
  },
  {
    subject: "lfg post #A-19",
    reason: "Off-platform spam",
    severity: "Low",
    status: "Queued for moderator action",
    evidence: "Repeated redirect links in post body",
  },
];

export const activityFeed = [
  "Your profile passed the 3-review threshold and now shows public trust badges.",
  "Night Circuit invited you to their ranked stack after a 92 synergy match.",
  "Two new LFG posts match your Valorant and Helldivers filters.",
  "Your latest clip is trending in the tactical shooters showcase.",
];

export const actionItems: ActionItem[] = [
  {
    id: "profile-confidence",
    title: "Finalize profile confidence settings",
    detail: "Set communication style and schedule depth to improve teammate overlap scores.",
    href: "/settings",
    priority: "High",
  },
  {
    id: "lfg-fast-join",
    title: "Apply to one matching LFG post",
    detail: "Use region and tone fit first so invite acceptance rates stay high.",
    href: "/lfg",
    priority: "High",
  },
  {
    id: "squad-stability",
    title: "Review persistent squad options",
    detail: "Move from ad-hoc sessions to repeat teams with better reliability outcomes.",
    href: "/squads",
    priority: "Medium",
  },
  {
    id: "clip-proof",
    title: "Add one new clip proof point",
    detail: "Fresh clips boost trust when players are deciding between comparable profiles.",
    href: "/clips",
    priority: "Low",
  },
];

export const trustControls = [
  "Require verified email before posting or reviewing.",
  "Hide public reputation aggregates until minimum reviewer threshold is met.",
  "Block duplicate session reviews and sudden negative-review clusters.",
  "Offer privacy, blocked users, notification, and billing controls in one place.",
];

export const notificationItems: NotificationItem[] = [
  {
    id: "invite-night-circuit",
    title: "Night Circuit invited you to ranked blocks",
    detail: "They matched your region and role overlap profile this week.",
    href: "/squads",
    category: "invite",
    priority: "High",
    createdAt: "2026-05-05T20:12:00.000Z",
  },
  {
    id: "trust-threshold",
    title: "Trust badge threshold reached",
    detail: "Your profile now shows public reliability indicators.",
    href: "/profile/ghosttrace",
    category: "trust",
    priority: "Medium",
    createdAt: "2026-05-05T19:46:00.000Z",
  },
  {
    id: "lfg-signal",
    title: "Three new LFG posts fit your timezone",
    detail: "Open spots are trending toward your preferred session window.",
    href: "/lfg",
    category: "content",
    priority: "High",
    createdAt: "2026-05-05T20:34:00.000Z",
  },
  {
    id: "billing-pro",
    title: "Pro analytics preview is available",
    detail: "See how profile changes affected your match quality this week.",
    href: "/settings",
    category: "billing",
    priority: "Low",
    createdAt: "2026-05-05T18:20:00.000Z",
  },
];