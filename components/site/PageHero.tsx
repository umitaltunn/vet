"use client";
import { motion } from "framer-motion";
import { Paw, pickPaw } from "../fx/Paw";

export function PageHero({ title, subtitle, pawType }: { title: string; subtitle?: string; pawType: string }) {
  return (
    <section className="page-hero">
      <div className="ph-paws" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <motion.span
            key={i}
            style={{ left: `${8 + i * 10.5}%`, top: `${i % 2 ? 58 : 30}%` }}
            initial={{ opacity: 0, scale: 0, rotate: 90 }}
            animate={{ opacity: 0.18, scale: 1, rotate: 90 }}
            transition={{ delay: 0.3 + i * 0.09, type: "spring" }}
          >
            <Paw kind={pickPaw(pawType, Math.floor(i / 2))} size={34} />
          </motion.span>
        ))}
      </div>
      <div className="container">
        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
