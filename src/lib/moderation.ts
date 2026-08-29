export type ModerationDecision = "auto_approved" | "needs_review" | "blocked";
export type ModerationRisk = "low" | "medium" | "high";

export type ModerationResult = {
  decision: ModerationDecision;
  risk: ModerationRisk;
  reason: string;
  signals: string[];
};

type SubmissionKind = "business" | "creative_job" | "recommendation" | "change_request";

type ModerationInput = {
  kind: SubmissionKind;
  texts: Array<string | null | undefined>;
  filenames?: string[];
  linkCount?: number;
  hasContact?: boolean;
  hasMedia?: boolean;
  duplicateHint?: boolean;
};

const blockedTerms = [
  "casino",
  "porn",
  "xxx",
  "escort",
  "onlyfans",
  "nudes",
  "viagra",
  "loan shark",
  "get rich quick",
  "crypto giveaway",
  "telegram me",
  "whatsapp only",
  "kill yourself",
  "hate speech",
  "terrorist",
  "counterfeit passport",
  "fake id",
];

const suspiciousTerms = [
  "free money",
  "guaranteed income",
  "limited time offer",
  "click here",
  "cheap followers",
  "seo backlink",
  "bulk email",
];

export function assessModeration(input: ModerationInput): ModerationResult {
  const text = input.texts.filter(Boolean).join(" \n ").toLowerCase();
  const filenames = (input.filenames ?? []).join(" \n ").toLowerCase();
  const combined = `${text}\n${filenames}`;
  const signals: string[] = [];

  const blockedMatch = blockedTerms.find((term) => combined.includes(term));
  if (blockedMatch) {
    return {
      decision: "blocked",
      risk: "high",
      reason: "Some wording or file names are not suitable for MakeSG.",
      signals: [`Blocked term detected: ${blockedMatch}`],
    };
  }

  const suspiciousMatches = suspiciousTerms.filter((term) => combined.includes(term));
  if (suspiciousMatches.length > 0) {
    signals.push(`Suspicious wording: ${suspiciousMatches.slice(0, 3).join(", ")}`);
  }

  const urlMatches = combined.match(/https?:\/\//g) ?? [];
  const linkCount = input.linkCount ?? urlMatches.length;
  if (linkCount > 3) signals.push("More than three links supplied.");
  if (hasExcessiveRepeats(combined)) signals.push("Repeated characters or words look spam-like.");
  if (hasShouting(input.texts)) signals.push("Large blocks of uppercase text.");
  if (input.duplicateHint) signals.push("Possible duplicate of an existing business.");
  if (input.hasContact === false) signals.push("No public contact route supplied.");

  const textLength = text.replace(/\s+/g, " ").trim().length;
  if (textLength < minimumUsefulLength(input.kind)) {
    signals.push("Submission has low detail.");
  }

  const risk = signals.length >= 3 || input.duplicateHint ? "high" : signals.length > 0 ? "medium" : "low";

  if (risk === "high") {
    return {
      decision: "needs_review",
      risk,
      reason: "This needs an admin to take a closer look before it goes public.",
      signals,
    };
  }

  if (risk === "medium") {
    return {
      decision: "needs_review",
      risk,
      reason: "This needs a quick admin check before it goes public.",
      signals,
    };
  }

  if (input.kind === "creative_job") {
    return {
      decision: "auto_approved",
      risk: "low",
      reason: "Looks good and can go public right away.",
      signals: ["Clean creative job submission."],
    };
  }

  return {
    decision: "needs_review",
    risk: "low",
    reason: "Ready for admin review.",
    signals: ["Clean submission."],
  };
}

export function moderationBlockMessage(result: ModerationResult) {
  return `${result.reason} Please update the wording or uploaded file names, then try again.`;
}

function minimumUsefulLength(kind: SubmissionKind) {
  switch (kind) {
    case "business":
      return 120;
    case "creative_job":
      return 80;
    case "recommendation":
      return 40;
    case "change_request":
      return 30;
  }
}

function hasExcessiveRepeats(text: string) {
  return /(.)\1{8,}/.test(text) || /\b(\w+)(\s+\1){5,}\b/.test(text);
}

function hasShouting(texts: Array<string | null | undefined>) {
  return texts.some((value) => {
    if (!value) return false;
    const letters = value.replace(/[^a-zA-Z]/g, "");
    if (letters.length < 30) return false;
    const upper = letters.replace(/[^A-Z]/g, "").length;
    return upper / letters.length > 0.8;
  });
}
