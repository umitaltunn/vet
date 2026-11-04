"use client";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Paw, pickPaw } from "./Paw";
import { pawBurst } from "./burst";

/** Gorunume girince yukari kayarak belirir. */
export function Reveal({ children, delay = 0, y = 40, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Basligi kelime kelime, yaylanarak yazar. */
export function HeroWords({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <h1 className={className} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="hw-wrap" aria-hidden>
            <motion.span
              className="hw"
              initial={reduce ? false : { y: "110%", rotate: 8, opacity: 0 }}
              animate={{ y: "0%", rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.25 + i * 0.07 }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
}

/** Hero arka planinda suzulen, fareye gore paralaks yapan patiler. */
export function FloatingPaws({ pawType, count = 14 }: { pawType: string; count?: number }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const [items] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      x: (i * 37 + 7) % 100,
      y: (i * 53 + 11) % 100,
      s: 18 + ((i * 29) % 46),
      r: (i * 47) % 360,
      d: 0.3 + ((i * 13) % 10) / 10,
      dur: 5 + ((i * 7) % 6),
    })),
  );
  useEffect(() => {
    if (reduce) return;
    const on = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 40);
      my.set((e.clientY / window.innerHeight - 0.5) * 40);
    };
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, [mx, my, reduce]);
  return (
    <div className="floating-paws" aria-hidden>
      {items.map((p, i) => (
        <FloatingPaw key={i} p={p} i={i} sx={sx} sy={sy} pawType={pawType} reduce={!!reduce} />
      ))}
    </div>
  );
}

function FloatingPaw({ p, i, sx, sy, pawType, reduce }: { p: { x: number; y: number; s: number; r: number; d: number; dur: number }; i: number; sx: ReturnType<typeof useSpring>; sy: ReturnType<typeof useSpring>; pawType: string; reduce: boolean }) {
  const tx = useTransform(sx, (v) => v * p.d);
  const ty = useTransform(sy, (v) => v * p.d);
  return (
    <motion.div className="fp" style={{ left: `${p.x}%`, top: `${p.y}%`, x: tx, y: ty }}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -18, 0], rotate: [p.r, p.r + 14, p.r] }}
        transition={{ opacity: { delay: 0.6 + i * 0.06 }, scale: { delay: 0.6 + i * 0.06, type: "spring" }, y: { repeat: Infinity, duration: p.dur, ease: "easeInOut" }, rotate: { repeat: Infinity, duration: p.dur * 1.3, ease: "easeInOut" } }}
      >
        <Paw kind={pickPaw(pawType, i)} size={p.s} />
      </motion.div>
    </motion.div>
  );
}

/** Gorunume girince 0'dan hedefe sayar. */
export function CountUp({ to, suffix = "", duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const c = animate(0, to, { duration, ease: "easeOut", onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString("tr-TR") + suffix) });
    return () => c.stop();
  }, [inView, to, suffix, duration]);
  return <span ref={ref}>0{suffix}</span>;
}

/** Tiklaninca pati patlatan sarmalayici. */
export function BurstOnClick({ children, colors, pawType, className }: { children: ReactNode; colors: string[]; pawType: string; className?: string }) {
  return (
    <span
      className={className}
      onClickCapture={(e) => pawBurst(e.clientX, e.clientY, { colors, count: 10, spread: 0.45, kinds: pawType === "karisik" ? ["kedi", "kopek"] : [pickPaw(pawType)] })}
    >
      {children}
    </span>
  );
}

/** Sayfanin altina inince kosede beliren, gozleriyle imleci takip eden sevimli dost. */
export function PeekingPet({ pawType, colors, message }: { pawType: string; colors: string[]; message: string }) {
  const [show, setShow] = useState(false);
  const [talk, setTalk] = useState(false);
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);
  const kind = pawType === "kus" ? "kus" : pawType === "kopek" ? "kopek" : "kedi";
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShow(max > 200 ? window.scrollY / max > 0.55 : true);
    };
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.max(1, Math.hypot(dx, dy));
      setEye({ x: (dx / d) * 3.2, y: (dy / d) * 3.2 });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return (
    <motion.button
      ref={ref}
      type="button"
      className="peek-pet"
      aria-label="Merhaba!"
      initial={{ y: 120 }}
      animate={{ y: show ? 0 : 120 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      onClick={(e) => {
        setTalk(true);
        pawBurst(e.clientX, e.clientY, { colors, count: 24, hearts: true, kinds: kind === "kus" ? ["kus"] : kind === "kopek" ? ["kopek"] : ["kedi"] });
        setTimeout(() => setTalk(false), 2600);
      }}
    >
      {talk && (
        <motion.span className="peek-bubble" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {message}
        </motion.span>
      )}
      <svg viewBox="0 0 120 90" width="104" height="78">
        {kind === "kedi" && (
          <>
            <path d="M18 70 L22 8 L50 34 Z" fill="var(--dark)" />
            <path d="M102 70 L98 8 L70 34 Z" fill="var(--dark)" />
            <path d="M26 30 L27 18 L40 31 Z" fill="var(--accent)" />
            <path d="M94 30 L93 18 L80 31 Z" fill="var(--accent)" />
            <ellipse cx="60" cy="68" rx="46" ry="38" fill="var(--dark)" />
          </>
        )}
        {kind === "kopek" && (
          <>
            <ellipse cx="60" cy="68" rx="44" ry="38" fill="var(--gold)" />
            <motion.ellipse cx="18" cy="52" rx="14" ry="28" fill="var(--dark)" animate={{ rotate: [10, 22, 10] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ originX: "18px", originY: "28px" }} />
            <motion.ellipse cx="102" cy="52" rx="14" ry="28" fill="var(--dark)" animate={{ rotate: [-10, -22, -10] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ originX: "102px", originY: "28px" }} />
          </>
        )}
        {kind === "kus" && (
          <>
            <ellipse cx="60" cy="68" rx="44" ry="40" fill="var(--primary)" />
            <path d="M50 30 Q60 6 70 30" fill="var(--accent)" />
            <path d="M60 58 L72 66 L60 72 Z" fill="var(--accent)" />
          </>
        )}
        <g className="peek-eyes">
          <ellipse cx="42" cy="58" rx="10" ry="11" fill="#fff" />
          <ellipse cx="78" cy="58" rx="10" ry="11" fill="#fff" />
          <circle cx={42 + eye.x} cy={59 + eye.y} r="5" fill="#111" />
          <circle cx={78 + eye.x} cy={59 + eye.y} r="5" fill="#111" />
          <circle cx={44 + eye.x} cy={56 + eye.y} r="1.6" fill="#fff" />
          <circle cx={80 + eye.x} cy={56 + eye.y} r="1.6" fill="#fff" />
        </g>
        {kind !== "kus" && <path d="M55 72 Q60 77 65 72" stroke={kind === "kedi" ? "var(--accent)" : "var(--dark)"} strokeWidth="3" fill="none" strokeLinecap="round" />}
        {kind === "kedi" && (
          <g stroke="#fff" strokeWidth="1.5" opacity=".7">
            <path d="M20 70 L38 72" /><path d="M20 78 L38 76" /><path d="M100 70 L82 72" /><path d="M100 78 L82 76" />
          </g>
        )}
        {kind === "kopek" && <ellipse cx="60" cy="70" rx="7" ry="5" fill="var(--dark)" />}
      </svg>
    </motion.button>
  );
}
