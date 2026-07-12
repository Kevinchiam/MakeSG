import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const hue = hash(slug) % 360;
  const accent = (hue + 62) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-label="Generated geometric placeholder for ${slug}">
    <rect width="1200" height="760" fill="hsl(${hue} 26% 88%)"/>
    <rect x="80" y="80" width="1040" height="600" fill="hsl(${hue} 18% 94%)" stroke="hsl(${hue} 20% 42%)" stroke-width="2"/>
    <circle cx="870" cy="250" r="180" fill="hsl(${accent} 36% 52%)" opacity=".28"/>
    <path d="M100 610 L450 210 L690 445 L850 315 L1100 610 Z" fill="hsl(${hue} 28% 42%)" opacity=".42"/>
    <path d="M130 125 H560 M130 165 H440 M130 205 H500" stroke="hsl(${hue} 18% 30%)" stroke-width="10" stroke-linecap="square" opacity=".65"/>
    <rect x="760" y="470" width="250" height="92" fill="hsl(${accent} 28% 46%)" opacity=".36"/>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

function hash(value: string) {
  return [...value].reduce((acc, char) => acc + char.charCodeAt(0) * 17, 0);
}
