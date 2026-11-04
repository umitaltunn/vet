"use client";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Paw, pickPaw } from "./Paw";

const N = 16;

/** Sayfa asagi kaydirildikca sag kenarda pati izleri bolumden bolume yurur. */
export function ScrollPawTrail({ pawType }: { pawType: string }) {
  const { scrollYProgress } = useScroll();
  const [count, setCount] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setCount(Math.round(v * N)));
  return (
    <div className="scroll-trail" aria-hidden>
      {Array.from({ length: N }, (_, i) => {
        const on = i < count;
        const side = i % 2 ? 14 : -2;
        return (
          <span
            key={i}
            className={`st-paw ${on ? "on" : ""} ${i === count - 1 ? "last" : ""}`}
            style={{ top: `${4 + (i / N) * 92}%`, left: side, transform: `rotate(${180 + (i % 2 ? 10 : -10)}deg)` }}
          >
            <Paw kind={pickPaw(pawType, Math.floor(i / 2))} size={20} />
          </span>
        );
      })}
    </div>
  );
}
