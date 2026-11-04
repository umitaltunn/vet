"use client";
import { useEffect } from "react";
import { pawSvgString, pickPaw } from "./Paw";

/** Masaustunde fare hareket ettikce silik pati izleri birakir. */
export function CursorPaws({ pawType, color }: { pawType: string; color: string }) {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = document.createElement("div");
    layer.className = "cursor-paw-layer";
    document.body.appendChild(layer);
    let lx = -1, ly = -1, n = 0;
    const onMove = (e: PointerEvent) => {
      if (lx < 0) { lx = e.clientX; ly = e.clientY; return; }
      const dx = e.clientX - lx, dy = e.clientY - ly;
      const dist = Math.hypot(dx, dy);
      if (dist < 70) return;
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      const side = n % 2 ? 1 : -1;
      const ox = (-dy / dist) * 9 * side, oy = (dx / dist) * 9 * side;
      const el = document.createElement("div");
      el.className = "cursor-paw";
      el.style.left = `${e.clientX + ox - 9}px`;
      el.style.top = `${e.clientY + oy - 9 + window.scrollY}px`;
      el.style.transform = `rotate(${ang}deg)`;
      el.innerHTML = pawSvgString(pickPaw(pawType, Math.floor(n / 2)), color, 18);
      layer.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
      if (layer.childElementCount > 24) layer.firstElementChild?.remove();
      lx = e.clientX; ly = e.clientY; n++;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      layer.remove();
    };
  }, [pawType, color]);
  return null;
}
