"use client";
import { motion } from "framer-motion";
import { useState } from "react";

type D = { day: string; total: number; reminder: number; online: number };

/** Son 14 gunun randevu grafigi: toplam sutun, icinde hatirlatma ve web payi. */
export function WeekChart({ data }: { data: D[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(4, ...data.map((d) => d.total));
  return (
    <div className="wchart">
      <div className="wchart-bars">
        {data.map((d, i) => {
          const date = new Date(`${d.day}T12:00:00Z`);
          return (
            <div key={d.day} className="wc-col" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {hover === i && (
                <div className="wc-tip">
                  <strong>{date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" })}</strong>
                  <span>Toplam: {d.total}</span><span>Hatırlatmadan: {d.reminder}</span><span>Web: {d.online}</span>
                </div>
              )}
              <div className="wc-stack">
                <motion.div className="wc-total" initial={{ height: 0 }} animate={{ height: `${(d.total / max) * 100}%` }} transition={{ delay: i * 0.03, type: "spring", stiffness: 120, damping: 18 }}>
                  <motion.div className="wc-web" initial={{ height: 0 }} animate={{ height: d.total ? `${(d.online / d.total) * 100}%` : 0 }} transition={{ delay: 0.3 + i * 0.03 }} />
                  <motion.div className="wc-rem" initial={{ height: 0 }} animate={{ height: d.total ? `${(d.reminder / d.total) * 100}%` : 0 }} transition={{ delay: 0.4 + i * 0.03 }} />
                </motion.div>
              </div>
              <span className="wc-label">{date.getUTCDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
