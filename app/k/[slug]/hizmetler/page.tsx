import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { getClinicByKey, siteBase } from "@/lib/clinic";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/fx/Motion";
import { PawLink } from "@/components/fx/PawTransition";
import { Paw, pickPaw } from "@/components/fx/Paw";
import { ServiceIcon } from "@/components/site/Icon";
import { TiltCard } from "@/components/site/TiltCard";

export const metadata = { title: "Hizmetler" };

export default async function Services({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinic = await getClinicByKey(slug);
  if (!clinic) notFound();
  const base = await siteBase(clinic);
  const services = await db.service.findMany({ where: { clinicId: clinic.id }, orderBy: { order: "asc" } });
  return (
    <>
      <PageHero title="Hizmetlerimiz" subtitle="Koruyucu hekimlikten ileri tedaviye kadar, dostunuzun ihtiyacı olan her şey." pawType={clinic.pawType} />
      <section className="section">
        <div className="container cards-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.08}>
              <TiltCard className="svc-card">
                <span className="svc-icon"><ServiceIcon name={s.icon} size={30} /></span>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="svc-meta">
                  <span><Clock size={14} /> {s.durationMin} dk</span>
                  {s.priceText && <span>{s.priceText}</span>}
                </div>
                {s.bookable && (
                  <PawLink href={`${base}/randevu?hizmet=${s.id}`} className="svc-link">
                    Randevu al <ArrowRight size={16} />
                  </PawLink>
                )}
                <span className="svc-stamp" aria-hidden><Paw kind={pickPaw(clinic.pawType, i)} size={70} /></span>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
