const reservedUsernames = new Set([
  "admin",
  "administrator",
  "mod",
  "moderator",
  "support",
  "system",
  "raidbase",
  "api",
  "root",
]);

const blockedSubstrings = ["fuck", "shit", "bitch", "nigger", "fag"];

const usernamePattern = /^[a-zA-Z0-9_.-]{3,24}$/;

type UsernameValidationResult =
  | {
      ok: true;
      normalized: string;
    }
  | {
      ok: false;
      reason: string;
    };

export function normalizeUsername(username: string) {
  return username.trim().normalize("NFKC").toLowerCase();
}

export function validateUsername(username: string): UsernameValidationResult {
  const normalized = normalizeUsername(username);

  if (!usernamePattern.test(normalized)) {
    return {
      ok: false,
      reason: "Username must be 3-24 chars and only use letters, numbers, dot, underscore, or hyphen.",
    };
  }

  if (reservedUsernames.has(normalized)) {
    return {
      ok: false,
      reason: "Username is reserved.",
    };
  }

  if (blockedSubstrings.some((term) => normalized.includes(term))) {
    return {
      ok: false,
      reason: "Username violates content rules.",
    };
  }

  return { ok: true, normalized };
}