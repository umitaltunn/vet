import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getClinicByKey, siteBase } from "@/lib/clinic";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/fx/Motion";
import { PawLink } from "@/components/fx/PawTransition";
import { Paw, pickPaw } from "@/components/fx/Paw";

export const metadata = { title: "Ekibimiz" };

export default async function Team({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinic = await getClinicByKey(slug);
  if (!clinic) notFound();
  const base = await siteBase(clinic);
  const vets = await db.vet.findMany({ where: { clinicId: clinic.id }, orderBy: { order: "asc" } });
  return (
    <>
      <PageHero title="Ekibimiz" subtitle="Hayvanları sadece tedavi etmeyen, onları gerçekten seven bir ekip." pawType={clinic.pawType} />
      <section className="section">
        <div className="container team-list">
          {vets.map((v, i) => (
            <Reveal key={v.id} delay={(i % 2) * 0.1}>
              <div className="team-row">
                <div className="team-photo big">
                  {v.photoUrl ? <img src={v.photoUrl} alt={v.name} /> : <span className="team-initials">{v.name.replace("Dr. ", "").split(" ").map((p) => p[0]).join("")}</span>}
                  <span className="team-paw"><Paw kind={pickPaw(clinic.pawType, i)} size={26} /></span>
                </div>
                <div>
                  <h3>{v.name}</h3>
                  <span className="eyebrow">{v.title}</span>
                  {v.bio && <p>{v.bio}</p>}
                  {v.bookable && <PawLink href={`${base}/randevu`} className="btn btn-ghost btn-sm">{v.name.split(" ").slice(0, 2).join(" ")} ile randevu</PawLink>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
