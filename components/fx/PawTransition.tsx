"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import { Paw, pickPaw } from "./Paw";

type Phase = "idle" | "cover" | "reveal";
type Ctx = { navigate: (href: string, x?: number, y?: number) => void; level: string };
const TransitionCtx = createContext<Ctx>({ navigate: () => {}, level: "sakin" });

const COVER_MS = 620;
const REVEAL_MS = 700;

/**
 * Sayfa gecisi: tiklanan noktadan klinik renginde bir daire acilir, ekranin bir
 * ucundan obur ucuna pati izleri yurur, ortada logo kalp gibi atar; yeni sayfa
 * gelince perde patilerle birlikte yukari cekilir.
 */
export function PawTransitionProvider({
  children,
  pawType,
  level,
  logoUrl,
  name,
}: {
  children: React.ReactNode;
  pawType: string;
  level: string;
  logoUrl?: string | null;
  name: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [seed, setSeed] = useState(0);
  const lastPath = useRef(pathname);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const off = reduce || level === "sakin";

  const navigate = useCallback(
    (href: string, x?: number, y?: number) => {
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname && target.search === window.location.search) return;
      if (off) {
        router.push(href);
        return;
      }
      router.prefetch(href);
      setOrigin({ x: x ?? 50, y: y ?? 50 });
      setSeed((s) => s + 1);
      setPhase("cover");
      setTimeout(() => router.push(href), COVER_MS);
      if (safety.current) clearTimeout(safety.current);
      safety.current = setTimeout(() => setPhase((p) => (p === "cover" ? "reveal" : p)), 3500);
    },
    [off, router],
  );

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    window.scrollTo({ top: 0 });
    if (phase === "cover") {
      const t = setTimeout(() => setPhase("reveal"), 60);
      return () => clearTimeout(t);
    }
  }, [pathname, phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => setPhase("idle"), REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Diyagonal pati yolu: tiklanan noktanin karsi kosesinden tiklanan noktaya dogru
  const steps = useMemo(() => {
    const n = level === "coskulu" ? 11 : 7;
    const fromLeft = origin.x > 50;
    const x0 = fromLeft ? -5 : 105, y0 = 108;
    const x1 = fromLeft ? 105 : -5, y1 = -8;
    const ang = (Math.atan2((y1 - y0) * window_h(), (x1 - x0) * window_w()) * 180) / Math.PI;
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      const side = i % 2 === 0 ? 1 : -1;
      const nx = -(y1 - y0), ny = x1 - x0;
      const len = Math.hypot(nx, ny);
      return {
        x: x0 + (x1 - x0) * t + (nx / len) * 3.2 * side,
        y: y0 + (y1 - y0) * t + (ny / len) * 3.2 * side,
        rot: ang + 90,
        kind: pickPaw(pawType, Math.floor(i / 2)),
        i,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, level, pawType]);

  return (
    <TransitionCtx.Provider value={{ navigate, level: off ? "sakin" : level }}>
      {children}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div key={seed} className="pt-overlay" aria-hidden initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
            <motion.div
              className="pt-curtain"
              initial={{ clipPath: `circle(0% at ${origin.x}% ${origin.y}%)` }}
              animate={
                phase === "cover"
                  ? { clipPath: `circle(150% at ${origin.x}% ${origin.y}%)`, transition: { duration: 0.6, ease: [0.7, 0, 0.2, 1] } }
                  : { clipPath: `circle(0% at 50% 50%)`, transition: { duration: 0.6, ease: [0.7, 0, 0.2, 1], delay: 0.08 } }
              }
            />
            <motion.div
              className="pt-curtain pt-curtain-2"
              initial={{ clipPath: `circle(0% at ${origin.x}% ${origin.y}%)` }}
              animate={
                phase === "cover"
                  ? { clipPath: `circle(150% at ${origin.x}% ${origin.y}%)`, transition: { duration: 0.6, ease: [0.7, 0, 0.2, 1], delay: 0.09 } }
                  : { clipPath: `circle(0% at 50% 50%)`, transition: { duration: 0.55, ease: [0.7, 0, 0.2, 1] } }
              }
            />
            {steps.map((s) => (
              <motion.div
                key={s.i}
                className="pt-step"
                style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: s.rot }}
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  phase === "cover"
                    ? { scale: [0, 1.35, 1], opacity: [0, 1, 0.95], transition: { delay: 0.05 + s.i * 0.045, duration: 0.32 } }
                    : { y: -60, scale: 0.4, opacity: 0, transition: { delay: s.i * 0.025, duration: 0.35 } }
                }
              >
                <Paw kind={s.kind} size="100%" />
              </motion.div>
            ))}
            <motion.div
              className="pt-center"
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={
                phase === "cover"
                  ? { scale: [0, 1.18, 1, 1.08, 1], rotate: 0, opacity: 1, transition: { delay: 0.22, duration: 0.7 } }
                  : { scale: 0.2, rotate: 25, opacity: 0, transition: { duration: 0.3 } }
              }
            >
              {logoUrl ? <img src={logoUrl} alt="" /> : <Paw kind={pickPaw(pawType)} size={84} />}
              {level === "coskulu" && <span className="pt-name">{name}</span>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionCtx.Provider>
  );
}

function window_w() {
  return typeof window === "undefined" ? 16 : window.innerWidth / 100;
}
function window_h() {
  return typeof window === "undefined" ? 9 : window.innerHeight / 100;
}

export function usePawNavigate() {
  return useContext(TransitionCtx);
}

/** Next Link'in pati gecisli versiyonu. */
export function PawLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const { navigate } = usePawNavigate();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || rest.target === "_blank") return;
        if (href.startsWith("#") || /^https?:|^tel:|^mailto:/.test(href)) return;
        e.preventDefault();
        navigate(href, (e.clientX / window.innerWidth) * 100, (e.clientY / window.innerHeight) * 100);
      }}
    />
  );
}
