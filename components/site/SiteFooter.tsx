import { AtSign, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Clinic } from "@prisma/client";
import { parseHours } from "@/lib/clinic";
import { DAY_NAMES_TR } from "@/lib/time";
import { Paw, pickPaw } from "../fx/Paw";
import { PawLink } from "../fx/PawTransition";

export function SiteFooter({ clinic, base }: { clinic: Clinic; base: string }) {
  const hours = parseHours(clinic.workingHours);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <footer className="site-footer">
      <div className="footer-walk" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.35}s`, left: `${i * 5.6}%`, top: i % 2 ? 6 : 22 }}>
            <Paw kind={pickPaw(clinic.pawType, Math.floor(i / 2))} size={18} />
          </span>
        ))}
      </div>
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            {clinic.logoUrl && <img src={clinic.logoUrl} alt="" />}
            <strong>{clinic.name}</strong>
          </div>
          <p className="muted">{clinic.tagline}</p>
          {clinic.emergencyPhone && (
            <a className="footer-emergency" href={`tel:${clinic.emergencyPhone.replace(/\s/g, "")}`}>
              Acil durumda 7/24: <strong>{clinic.emergencyPhone}</strong>
            </a>
          )}
        </div>
        <div>
          <h4><Clock size={16} /> Çalışma Saatleri</h4>
          <ul className="hours">
            {order.map((d) => (
              <li key={d}>
                <span>{DAY_NAMES_TR[d]}</span>
                <span>{hours[String(d)]?.length ? hours[String(d)].map(([a, b]) => `${a}–${b}`).join(", ") : "Kapalı"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>İletişim</h4>
          <ul className="contact-list">
            {clinic.address && <li><MapPin size={16} /> {clinic.address}{clinic.city ? `, ${clinic.city}` : ""}</li>}
            {clinic.phone && <li><Phone size={16} /> <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phone}</a></li>}
            {clinic.email && <li><Mail size={16} /> <a href={`mailto:${clinic.email}`}>{clinic.email}</a></li>}
            {clinic.instagram && <li><AtSign size={16} /> <a href={`https://instagram.com/${clinic.instagram}`} target="_blank" rel="noreferrer">@{clinic.instagram}</a></li>}
          </ul>
          <PawLink href={`${base}/randevu`} className="btn btn-accent" style={{ marginTop: 16 }}>Online Randevu</PawLink>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {clinic.name}</span>
        <span>
          Kişisel verileriniz KVKK kapsamında korunur. · <a href="/" target="_blank">PatiPanel</a> ile hazırlandı
        </span>
      </div>
    </footer>
  );
}
