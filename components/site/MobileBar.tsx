"use client";
import { CalendarHeart, MessageCircle, Phone } from "lucide-react";
import { PawLink } from "../fx/PawTransition";
import { waLink } from "@/lib/phone";

export function MobileBar({ base, phone, whatsapp, name }: { base: string; phone: string; whatsapp: string; name: string }) {
  return (
    <div className="mobile-bar">
      {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}><Phone size={20} /><span>Ara</span></a>}
      <PawLink href={`${base}/randevu`} className="mb-main"><CalendarHeart size={22} /><span>Randevu Al</span></PawLink>
      {whatsapp && <a href={waLink(whatsapp, `Merhaba ${name}, bilgi almak istiyorum.`)} target="_blank" rel="noreferrer"><MessageCircle size={20} /><span>WhatsApp</span></a>}
    </div>
  );
}
