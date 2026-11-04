"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BellRing, CalendarDays, Image as ImageIcon, LayoutDashboard, MessageSquareText, Palette, PawPrint, Stethoscope, Users } from "lucide-react";

const LINKS = [
  { href: "/panel", label: "Özet", icon: LayoutDashboard },
  { href: "/panel/randevular", label: "Randevular", icon: CalendarDays },
  { href: "/panel/hastalar", label: "Hastalar", icon: PawPrint },
  { href: "/panel/hatirlatmalar", label: "Hatırlatmalar", icon: BellRing },
  { href: "/panel/mesajlar", label: "Mesajlar", icon: MessageSquareText },
  { href: "/panel/site", label: "Web Sitesi", icon: Palette },
  { href: "/panel/hizmetler", label: "Hizmetler", icon: Stethoscope },
  { href: "/panel/ekip", label: "Ekip", icon: Users },
  { href: "/panel/icerik", label: "Galeri & Yorumlar", icon: ImageIcon },
];

export function PanelNav({ pending }: { pending: number }) {
  const path = usePathname();
  return (
    <nav className="pn-nav">
      {LINKS.map((l) => {
        const active = l.href === "/panel" ? path === "/panel" : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={`pn-link ${active ? "active" : ""}`}>
            {active && <motion.span layoutId="pn-active" className="pn-active" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
            <l.icon size={18} />
            <span>{l.label}</span>
            {l.href === "/panel/randevular" && pending > 0 && <span className="pn-badge">{pending}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
