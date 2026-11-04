"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Paw } from "../fx/Paw";

/** Platform ana sayfasinda ekranin ustunden bir kedi ve bir kopek yan yana yurur. */
export function PlatformWalk() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const steps = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div className="pf-walk" aria-hidden>
      {steps.map((i) => (
        <motion.span
          key={`c${i}`}
          className="pfw cat"
          style={{ left: `${i * 4.8}%`, top: i % 2 ? 14 : 30 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.9, 0.9, 0], scale: [0, 1, 1, 0.8] }}
          transition={{ delay: 0.4 + i * 0.16, duration: 3.6, times: [0, 0.08, 0.7, 1], repeat: Infinity, repeatDelay: 22 * 0.16 - 0.4 }}
        >
          <Paw kind="kedi" size={16} style={{ transform: "rotate(90deg)" }} />
        </motion.span>
      ))}
      {steps.map((i) => (
        <motion.span
          key={`d${i}`}
          className="pfw dog"
          style={{ left: `${i * 4.8 - 2}%`, top: i % 2 ? 46 : 64 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.9, 0.9, 0], scale: [0, 1, 1, 0.8] }}
          transition={{ delay: 0.9 + i * 0.16, duration: 3.6, times: [0, 0.08, 0.7, 1], repeat: Infinity, repeatDelay: 22 * 0.16 - 0.4 }}
        >
          <Paw kind="kopek" size={20} style={{ transform: "rotate(90deg)" }} />
        </motion.span>
      ))}
    </div>
  );
}
