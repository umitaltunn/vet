import { notFound } from "next/navigation";
import { ArrowRight, BellRing, CalendarHeart, HeartHandshake, MapPin, QrCode, Quote, Siren, Star } from "lucide-react";
import { db } from "@/lib/db";
import { getClinicByKey, siteBase } from "@/lib/clinic";
import { todayText } from "@/lib/site-data";
import { Hero } from "@/components/site/Hero";
import { Reveal, BurstOnClick } from "@/components/fx/Motion";
import { PawLink } from "@/components/fx/PawTransition";
import { Paw, pickPaw } from "@/components/fx/Paw";
import { ServiceIcon } from "@/components/site/Icon";
import { TiltCard } from "@/components/site/TiltCard";

export default async function ClinicHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinic = await getClinicByKey(slug);
  if (!clinic) notFound();
  const base = await siteBase(clinic);
  const [services, vets, testimonials, pets] = await Promise.all([
    db.service.findMany({ where: { clinicId: clinic.id }, orderBy: { order: "asc" } }),
    db.vet.findMany({ where: { clinicId: clinic.id }, orderBy: { order: "asc" } }),
    db.testimonial.findMany({ where: { clinicId: clinic.id } }),
    db.pet.count({ where: { clinicId: clinic.id } }),
  ]);
  const colors = [clinic.accentColor, clinic.primaryColor, clinic.goldColor];

  const features = [
    { icon: CalendarHeart, title: "7/24 online randevu", text: "Telefonda beklemeden, gece yarısı bile saniyeler içinde randevu alın." },
    { icon: BellRing, title: "Aşı hatırlatma", text: "Aşı ve kontrol zamanı geldiğinde WhatsApp'tan haber veririz, tek tıkla randevu." },
    { icon: QrCode, title: "Dijital aşı karnesi", text: "Dostunuzun tüm aşıları telefonunuzda. Kağıt karne kaybolmaz." },
    { icon: clinic.emergencyPhone ? Siren : HeartHandshake, title: clinic.emergencyPhone ? "Acil durumda yanınızdayız" : "Korkusuz muayene", text: clinic.emergencyPhone ? `Acil hattımız: ${clinic.emergencyPhone}` : "Sakin ortam, sabırlı ekip, ödül mamaları." },
  ];

  return (
    <>
      <Hero
        theme={clinic.theme}
        pawType={clinic.pawType}
        base={base}
        name={clinic.name}
        tagline={clinic.tagline}
        title={clinic.heroTitle}
        subtitle={clinic.heroSubtitle}
        logoUrl={clinic.logoUrl}
        whatsapp={clinic.whatsapp}
        todayText={todayText(clinic)}
        stats={{ vets: vets.length, services: services.length, pets, reviews: testimonials.length }}
        colors={colors}
      />

      {/* Kayan hizmet seridi */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...services, ...services, ...services].map((s, i) => (
            <span key={i}>
              {s.name} <Paw kind={pickPaw(clinic.pawType, i)} size={18} />
            </span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow"><Paw kind={pickPaw(clinic.pawType)} size={14} /> Hizmetlerimiz</span>
            <h2>Burundan kuyruğa her şey için buradayız</h2>
          </Reveal>
          <div className="cards-3">
            {services.slice(0, 6).map((s, i) => (
              <Reveal key={s.id} delay={i * 0.07}>
                <TiltCard className="svc-card">
                  <span className="svc-icon"><ServiceIcon name={s.icon} size={30} /></span>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <PawLink href={`${base}/randevu?hizmet=${s.id}`} className="svc-link">
                    Randevu al <ArrowRight size={16} />
                  </PawLink>
                  <span className="svc-stamp" aria-hidden><Paw kind={pickPaw(clinic.pawType, i)} size={70} /></span>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container split">
          <Reveal>
            <span className="eyebrow"><Paw kind={pickPaw(clinic.pawType)} size={14} /> Hakkımızda</span>
            <h2>Neden {clinic.name.split(" ").slice(0, 2).join(" ")}?</h2>
            <p className="lead">{clinic.about}</p>
            <PawLink href={`${base}/ekip`} className="btn btn-ghost">Ekibimizle tanışın <ArrowRight size={16} /></PawLink>
          </Reveal>
          <div className="features">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1} className="feature">
                <span className="feature-icon"><f.icon size={22} /></span>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {vets.length > 0 && (
        <section className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow"><Paw kind={pickPaw(clinic.pawType)} size={14} /> Ekibimiz</span>
              <h2>Dostunuzu emanet edeceğiniz eller</h2>
            </Reveal>
            <div className="team-grid">
              {vets.slice(0, 4).map((v, i) => (
                <Reveal key={v.id} delay={i * 0.08}>
                  <div className="team-card">
                    <div className="team-photo">
                      {v.photoUrl ? <img src={v.photoUrl} alt={v.name} /> : <span className="team-initials">{v.name.replace("Dr. ", "").split(" ").map((p) => p[0]).join("")}</span>}
                      <span className="team-paw"><Paw kind={pickPaw(clinic.pawType, i)} size={22} /></span>
                    </div>
                    <h4>{v.name}</h4>
                    <small>{v.title}</small>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow"><Star size={14} fill="currentColor" /> Mutlu dostlar</span>
              <h2>Patili ailemiz ne diyor?</h2>
            </Reveal>
          </div>
          <div className="testi-rail">
            <div className="testi-track">
              {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <figure key={i} className="testi">
                  <Quote className="testi-q" size={28} />
                  <blockquote>{t.text}</blockquote>
                  <figcaption>
                    <span className="stars">{"★".repeat(t.rating)}</span>
                    <strong>{t.author}</strong> · {t.petName}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cta-band">
        <div className="cta-walk" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ left: `${i * 7.5}%`, top: i % 2 ? "62%" : "72%", animationDelay: `${i * 0.18}s` }}>
              <Paw kind={pickPaw(clinic.pawType, Math.floor(i / 2))} size={26} />
            </span>
          ))}
        </div>
        <div className="container cta-inner">
          <Reveal>
            <h2>Aşı zamanı mı geldi? Kontrol mü lazım?</h2>
            <p>30 saniyede randevunuzu alın, gerisini bize bırakın.</p>
          </Reveal>
          <BurstOnClick colors={["#fff", clinic.goldColor, clinic.accentColor]} pawType={clinic.pawType}>
            <PawLink href={`${base}/randevu`} className="btn btn-white btn-lg btn-paw">
              <CalendarHeart size={20} /> Hemen Randevu Al
            </PawLink>
          </BurstOnClick>
        </div>
      </section>

      {clinic.mapQuery && (
        <section className="section">
          <div className="container split">
            <Reveal>
              <span className="eyebrow"><MapPin size={14} /> Bize ulaşın</span>
              <h2>Kapımız her zaman açık</h2>
              <p className="lead">{clinic.address}{clinic.city ? `, ${clinic.city}` : ""}</p>
              <PawLink href={`${base}/iletisim`} className="btn btn-ghost">Yol tarifi ve iletişim <ArrowRight size={16} /></PawLink>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="map-frame">
                <iframe title="Harita" loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(clinic.mapQuery)}&z=15&output=embed`} />
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
