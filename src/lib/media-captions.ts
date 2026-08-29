type CaptionInput = {
  caption?: string | null;
  fileName?: string | null;
  fallback: string;
  mediaKind?: "photo" | "video" | "media";
};

const genericNamePatterns = [
  /^image$/i,
  /^photo$/i,
  /^video$/i,
  /^upload$/i,
  /^img[-_\s]?\d+$/i,
  /^dsc[-_\s]?\d+$/i,
  /^screenshot(\s+\d{4}[-_\s]\d{2}[-_\s]\d{2}.*)?$/i,
  /^screen shot(\s+\d{4}[-_\s]\d{2}[-_\s]\d{2}.*)?$/i,
];

export function smartMediaCaption({ caption, fileName, fallback, mediaKind = "media" }: CaptionInput) {
  const userCaption = caption?.trim();
  if (userCaption) return userCaption;

  const cleanedFileName = readableFileName(fileName);
  if (cleanedFileName && !genericNamePatterns.some((pattern) => pattern.test(cleanedFileName))) {
    return cleanedFileName;
  }

  return `${fallback} ${mediaKind === "video" ? "video" : mediaKind === "photo" ? "photo" : "media"}`.trim();
}

function readableFileName(fileName?: string | null) {
  if (!fileName) return "";
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const cleaned = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
