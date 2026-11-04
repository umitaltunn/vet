"use client";
import { pawSvgString, type PawKind } from "./Paw";

/**
 * Ekranda bir noktadan pati konfetisi patlatir. Web Animations API ile,
 * React'e dokunmadan, 60fps calisir. Hareket azaltma tercihine saygi duyar.
 */
export function pawBurst(x: number, y: number, opts: { colors?: string[]; kinds?: PawKind[]; count?: number; spread?: number; hearts?: boolean } = {}) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = opts.colors ?? ["#F06F62", "#247C86", "#C7A77A"];
  const kinds = opts.kinds ?? ["kedi", "kopek"];
  const count = opts.count ?? 36;
  const spread = opts.spread ?? 1;
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(layer);
  let alive = count;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const size = 14 + Math.random() * 26;
    const color = colors[i % colors.length];
    const heart = opts.hearts && i % 5 === 0;
    el.innerHTML = heart
      ? `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4 6.3 4c2.2 0 3.7 1.3 4.7 2.8C12 5.3 13.5 4 15.7 4c4 0 5.9 4.4 4.3 7.7C19.5 16.4 12 21 12 21z"/></svg>`
      : pawSvgString(kinds[i % kinds.length], color, size);
    el.style.cssText = `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;will-change:transform,opacity`;
    layer.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const power = (180 + Math.random() * 320) * spread;
    const dx = Math.cos(angle) * power;
    const dy = Math.sin(angle) * power - 220 * spread;
    const rot = (Math.random() - 0.5) * 720;
    const dur = 1200 + Math.random() * 900;
    const anim = el.animate(
      [
        { transform: "translate(0,0) scale(0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px,${dy * 0.6}px) scale(1.15) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px,${dy + 420 * spread}px) scale(0.9) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
    );
    anim.onfinish = () => {
      el.remove();
      if (--alive === 0) layer.remove();
    };
  }
}
