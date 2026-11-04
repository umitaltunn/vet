import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getClinicByKey } from "@/lib/clinic";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/fx/Motion";
import { Paw, pickPaw } from "@/components/fx/Paw";

export const metadata = { title: "Galeri" };

const PLACEHOLDERS = ["Bekleme salonumuz", "Muayene odası", "Kedi dostu alan", "Ameliyathane", "Pet kuaför", "Mutlu hastalarımız"];

export default async function Gallery({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinic = await getClinicByKey(slug);
  if (!clinic) notFound();
  const images = await db.galleryImage.findMany({ where: { clinicId: clinic.id }, orderBy: { order: "asc" } });
  return (
    <>
      <PageHero title="Galeri" subtitle="Kliniğimizden ve patili misafirlerimizden kareler." pawType={clinic.pawType} />
      <section className="section">
        <div className="container gallery">
          {images.length > 0
            ? images.map((g, i) => (
                <Reveal key={g.id} delay={(i % 3) * 0.08} className="g-item">
                  <img src={g.url} alt={g.caption} loading="lazy" />
                  {g.caption && <span className="g-cap">{g.caption}</span>}
                </Reveal>
              ))
            : PLACEHOLDERS.map((c, i) => (
                <Reveal key={c} delay={(i % 3) * 0.08} className={`g-item g-ph g-ph-${i % 3}`}>
                  <Paw kind={pickPaw(clinic.pawType, i)} size={90} />
                  <span className="g-cap">{c}</span>
                </Reveal>
              ))}
        </div>
        {images.length === 0 && <p className="container muted center">Fotoğraflar klinik panelinden yüklenir.</p>}
      </section>
    </>
  );
}
