import type { CSSProperties } from "react";

export type PawKind = "kedi" | "kopek" | "kus";

/** Pati izi cizimleri (100x100). Renk currentColor'dan gelir. */
export const PAW_SVG: Record<PawKind, string> = {
  kedi:
    '<path d="M50 50c-13 0-27 12-27 26 0 9 7 14 15 13 5-1 8-3 12-3s7 2 12 3c8 1 15-4 15-13 0-14-14-26-27-26z"/>' +
    '<ellipse cx="19" cy="44" rx="9" ry="11.5" transform="rotate(-24 19 44)"/>' +
    '<ellipse cx="37" cy="23" rx="9" ry="12" transform="rotate(-8 37 23)"/>' +
    '<ellipse cx="63" cy="23" rx="9" ry="12" transform="rotate(8 63 23)"/>' +
    '<ellipse cx="81" cy="44" rx="9" ry="11.5" transform="rotate(24 81 44)"/>',
  kopek:
    '<path d="M50 48c-15 0-29 14-29 28 0 10 8 15 16 13l7-2c4-1 8-1 12 0l7 2c8 2 16-3 16-13 0-14-14-28-29-28z"/>' +
    '<path d="M15 42c-2-8 2-17 9-17 7 0 11 9 9 17-2 7-7 10-11 9-4 0-6-4-7-9z"/>' +
    '<path d="M32 22c-1-9 3-17 10-17s10 8 9 17c-1 7-5 10-9.5 10S33 29 32 22z" transform="translate(-3 0)"/>' +
    '<path d="M50 22c-1-9 3-17 10-17s10 8 9 17c-1 7-5 10-9.5 10S51 29 50 22z" transform="translate(3 0)"/>' +
    '<path d="M85 42c2-8-2-17-9-17-7 0-11 9-9 17 2 7 7 10 11 9 4 0 6-4 7-9z"/>',
  kus:
    '<g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M50 92V50"/><path d="M50 52L22 14"/><path d="M50 52V8"/><path d="M50 52L78 14"/>' +
    "</g>",
};

export function pawSvgString(kind: PawKind, color: string, size = 32) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" fill="${color}" style="color:${color}">${PAW_SVG[kind]}</svg>`;
}

export function pickPaw(type: string, i = 0): PawKind {
  if (type === "kedi" || type === "kopek" || type === "kus") return type;
  return i % 2 === 0 ? "kedi" : "kopek";
}

export function Paw({ kind = "kedi", size = 32, color = "currentColor", className, style }: { kind?: PawKind; size?: number | string; color?: string; className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill={color}
      className={className}
      style={{ color, ...style }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: PAW_SVG[kind] }}
    />
  );
}
