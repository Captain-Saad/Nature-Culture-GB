/**
 * Basic profanity/spam guard for public review submissions, per
 * backend_prompt.md Phase 5: "simple keyword filter is enough for v1."
 * Not a replacement for human moderation — flagged submissions are
 * rejected at the API with a 400 rather than silently stored, so a
 * legitimate reviewer gets immediate feedback and can revise.
 */

const BANNED_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "dick",
  "piss",
  "slut",
  "whore",
];

const URL_PATTERN = /https?:\/\/|www\./gi;

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
}

export function moderateText(text: string): ModerationResult {
  const lower = text.toLowerCase();

  for (const word of BANNED_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, "i");
    if (re.test(lower)) {
      return { flagged: true, reason: "inappropriate language" };
    }
  }

  const urlMatches = text.match(URL_PATTERN);
  if (urlMatches && urlMatches.length >= 2) {
    return { flagged: true, reason: "too many links" };
  }

  if (/(.)\1{7,}/.test(text)) {
    return { flagged: true, reason: "repeated characters" };
  }

  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 20) {
    const upper = letters.replace(/[^A-Z]/g, "");
    if (upper.length / letters.length > 0.8) {
      return { flagged: true, reason: "excessive caps" };
    }
  }

  return { flagged: false };
}
