"use client";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { PawLink } from "../fx/PawTransition";
import { Paw, pickPaw } from "../fx/Paw";

export function SiteHeader({ base, name, logoUrl, phone, pawType }: { base: string; name: string; logoUrl: string | null; phone: string; pawType: string }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 40));
  const links = [
    { href: base || "/", label: "Ana Sayfa" },
    { href: `${base}/hizmetler`, label: "Hizmetler" },
    { href: `${base}/ekip`, label: "Ekibimiz" },
    { href: `${base}/galeri`, label: "Galeri" },
    { href: `${base}/iletisim`, label: "İletişim" },
  ];
  const isActive = (href: string) => (href === (base || "/") ? pathname === href || pathname === href + "/" : pathname.startsWith(href));
  return (
    <header className={`site-header ${compact ? "compact" : ""}`}>
      <div className="container sh-inner">
        <PawLink href={base || "/"} className="sh-brand">
          {logoUrl ? <img src={logoUrl} alt="" className="sh-logo" /> : <span className="sh-logo-fallback"><Paw kind={pickPaw(pawType)} size={26} /></span>}
          <span className="sh-name">{name}</span>
        </PawLink>
        <nav className="sh-nav">
          {links.map((l) => (
            <PawLink key={l.href} href={l.href} className={`sh-link ${isActive(l.href) ? "active" : ""}`}>
              {l.label}
              {isActive(l.href) && (
                <motion.span layoutId="nav-paw" className="sh-paw" transition={{ type: "spring", stiffness: 400, damping: 28 }}>
                  <Paw kind={pickPaw(pawType)} size={14} />
                </motion.span>
              )}
            </PawLink>
          ))}
        </nav>
        <div className="sh-actions">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="sh-phone">
              <Phone size={16} /> {phone}
            </a>
          )}
          <PawLink href={`${base}/randevu`} className="btn btn-primary btn-paw">
            Randevu Al
          </PawLink>
          <button className="sh-burger" onClick={() => setOpen(true)} aria-label="Menü">
            <Menu />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="sh-drawer" initial={{ clipPath: "circle(0% at 100% 0%)" }} animate={{ clipPath: "circle(150% at 100% 0%)" }} exit={{ clipPath: "circle(0% at 100% 0%)" }} transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}>
            <button className="sh-close" onClick={() => setOpen(false)} aria-label="Kapat">
              <X />
            </button>
            {[...links, { href: `${base}/randevu`, label: "Randevu Al" }].map((l, i) => (
              <motion.div key={l.href} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06 }}>
                <PawLink href={l.href} className="sh-drawer-link" onClick={() => setOpen(false)}>
                  <Paw kind={pickPaw(pawType, i)} size={22} /> {l.label}
                </PawLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
