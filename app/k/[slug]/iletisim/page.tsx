import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, MessageCircle, Phone, Siren } from "lucide-react";
import { getClinicByKey, parseHours, siteBase } from "@/lib/clinic";
import { DAY_NAMES_TR } from "@/lib/time";
import { waLink } from "@/lib/phone";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/fx/Motion";
import { PawLink } from "@/components/fx/PawTransition";

export const metadata = { title: "İletişim" };

export default async function Contact({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinic = await getClinicByKey(slug);
  if (!clinic) notFound();
  const base = await siteBase(clinic);
  const hours = parseHours(clinic.workingHours);
  return (
    <>
      <PageHero title="İletişim" subtitle="Sorunuz mu var? Bir mesaj kadar uzağız." pawType={clinic.pawType} />
      <section className="section">
        <div className="container split">
          <div className="contact-cards">
            {clinic.phone && <Reveal className="c-card"><Phone /><div><small>Telefon</small><a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phone}</a></div></Reveal>}
            {clinic.whatsapp && <Reveal delay={0.05} className="c-card"><MessageCircle /><div><small>WhatsApp</small><a href={waLink(clinic.whatsapp, `Merhaba ${clinic.name}`)} target="_blank" rel="noreferrer">{clinic.whatsapp}</a></div></Reveal>}
            {clinic.emergencyPhone && <Reveal delay={0.1} className="c-card danger"><Siren /><div><small>Acil (7/24)</small><a href={`tel:${clinic.emergencyPhone.replace(/\s/g, "")}`}>{clinic.emergencyPhone}</a></div></Reveal>}
            {clinic.email && <Reveal delay={0.15} className="c-card"><Mail /><div><small>E-posta</small><a href={`mailto:${clinic.email}`}>{clinic.email}</a></div></Reveal>}
            {clinic.address && <Reveal delay={0.2} className="c-card"><MapPin /><div><small>Adres</small><span>{clinic.address}{clinic.city ? `, ${clinic.city}` : ""}</span></div></Reveal>}
            <Reveal delay={0.25} className="c-card">
              <Clock />
              <div>
                <small>Çalışma saatleri</small>
                <ul className="hours compact">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <li key={d}><span>{DAY_NAMES_TR[d]}</span><span>{hours[String(d)]?.length ? hours[String(d)].map(([a, b]) => `${a}–${b}`).join(", ") : "Kapalı"}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <PawLink href={`${base}/randevu`} className="btn btn-primary btn-lg btn-paw">Online Randevu Al</PawLink>
          </div>
          <Reveal delay={0.1}>
            <div className="map-frame tall">
              <iframe title="Harita" loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(clinic.mapQuery || clinic.address)}&z=15&output=embed`} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
