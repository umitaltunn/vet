"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CalendarHeart, Clock, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { FloatingPaws, HeroWords, CountUp, BurstOnClick } from "../fx/Motion";
import { Paw, pickPaw } from "../fx/Paw";
import { PawLink } from "../fx/PawTransition";
import { waLink } from "@/lib/phone";

type Props = {
  theme: string;
  pawType: string;
  base: string;
  name: string;
  tagline: string;
  title: string;
  subtitle: string;
  logoUrl: string | null;
  whatsapp: string;
  todayText: string;
  stats: { vets: number; services: number; pets: number; reviews: number };
  colors: string[];
};

export function Hero(p: Props) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const yArt = useTransform(scrollY, [0, 600], [0, 120]);
  const yText = useTransform(scrollY, [0, 600], [0, 60]);
  return (
    <section className={`hero hero-${p.theme}`}>
      <FloatingPaws pawType={p.pawType} />
      {p.theme === "egzotik" && <Leaves />}
      <div className="container hero-grid">
        <motion.div className="hero-text" style={reduce ? undefined : { y: yText }}>
          <motion.span className="hero-badge" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paw kind={pickPaw(p.pawType)} size={16} /> {p.tagline}
          </motion.span>
          <HeroWords text={p.title} className="hero-title" />
          <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            {p.subtitle}
          </motion.p>
          <motion.div className="hero-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}>
            <BurstOnClick colors={p.colors} pawType={p.pawType}>
              <PawLink href={`${p.base}/randevu`} className="btn btn-primary btn-lg btn-paw btn-glow">
                <CalendarHeart size={20} /> Online Randevu Al
              </PawLink>
            </BurstOnClick>
            {p.whatsapp && (
              <a className="btn btn-ghost btn-lg" href={waLink(p.whatsapp, `Merhaba ${p.name}, bilgi almak istiyorum.`)} target="_blank" rel="noreferrer">
                <MessageCircle size={20} /> WhatsApp
              </a>
            )}
          </motion.div>
          {p.theme === "modern" ? (
            <div className="hero-stats">
              <div><strong><CountUp to={p.stats.vets} /></strong><span>Uzman hekim</span></div>
              <div><strong><CountUp to={p.stats.services} /></strong><span>Branş ve hizmet</span></div>
              <div><strong>7/24</strong><span>Acil hattı</span></div>
            </div>
          ) : (
            <motion.div className="hero-chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.25 }}>
              <span><Clock size={15} /> {p.todayText}</span>
              <span><ShieldCheck size={15} /> Aşı zamanını biz hatırlatırız</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div className="hero-art" style={reduce ? undefined : { y: yArt }}>
          <motion.div className="hero-blob" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }} />
          <div className="hero-orbit" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} style={{ transform: `rotate(${i * 45}deg) translateY(calc(var(--orbit) * -1)) rotate(${90}deg)` }}>
                <Paw kind={pickPaw(p.pawType, i)} size={22} />
              </span>
            ))}
          </div>
          <motion.div
            className="hero-logo"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 11, delay: 0.45 }}
            whileHover={{ scale: 1.06, rotate: -3 }}
          >
            {p.logoUrl ? <img src={p.logoUrl} alt={p.name} /> : <Paw kind={pickPaw(p.pawType)} size={180} color="var(--primary)" />}
          </motion.div>
          <motion.div className="hero-card hc-1" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.3, type: "spring" }}>
            <span className="hc-icon"><CalendarHeart size={18} /></span>
            <div><strong>30 saniyede</strong><small>online randevu</small></div>
          </motion.div>
          {p.stats.reviews > 0 && (
            <motion.div className="hero-card hc-2" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5, type: "spring" }}>
              <span className="hc-icon gold"><Star size={18} fill="currentColor" /></span>
              <div><strong>{p.stats.pets > 0 ? `${p.stats.pets}+ mutlu dost` : "Mutlu dostlar"}</strong><small>bize güveniyor</small></div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <svg className="hero-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
        <path d="M0,64 C240,120 480,0 720,48 C960,96 1200,24 1440,64 L1440,120 L0,120 Z" />
      </svg>
    </section>
  );
}

function Leaves() {
  return (
    <div className="leaves" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <motion.svg
          key={i}
          viewBox="0 0 100 200"
          className={`leaf leaf-${i}`}
          animate={{ rotate: [i % 2 ? -6 : 6, i % 2 ? 6 : -6, i % 2 ? -6 : 6] }}
          transition={{ repeat: Infinity, duration: 5 + i, ease: "easeInOut" }}
        >
          <path d="M50 200 C50 140 50 80 50 0" stroke="currentColor" strokeWidth="3" fill="none" />
          {Array.from({ length: 7 }, (_, k) => (
            <g key={k}>
              <path d={`M50 ${170 - k * 24} C${20} ${160 - k * 24} ${6} ${140 - k * 24} 4 ${120 - k * 24} C24 ${128 - k * 24} 44 ${144 - k * 24} 50 ${158 - k * 24}Z`} fill="currentColor" />
              <path d={`M50 ${170 - k * 24} C${80} ${160 - k * 24} ${94} ${140 - k * 24} 96 ${120 - k * 24} C76 ${128 - k * 24} 56 ${144 - k * 24} 50 ${158 - k * 24}Z`} fill="currentColor" />
            </g>
          ))}
        </motion.svg>
      ))}
    </div>
  );
}
