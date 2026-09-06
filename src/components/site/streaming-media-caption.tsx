import type { CSSProperties } from "react";

type StreamingMediaCaptionProps = {
  text: string;
  className?: string;
};

export function StreamingMediaCaption({ text, className }: StreamingMediaCaptionProps) {
  const caption = text.trim() || "Portfolio work";
  const duration = `${Math.max(8, Math.min(20, Math.round(caption.length / 4)))}s`;

  return (
    <small
      className={`media-caption-stream ${className ?? ""}`.trim()}
      style={{ "--caption-duration": duration } as CSSProperties}
      role="text"
      aria-label={caption}
    >
      <span className="media-caption-track" aria-hidden="true">
        <span className="media-caption-copy">{caption}</span>
        <span className="media-caption-copy">{caption}</span>
      </span>
    </small>
  );
}
