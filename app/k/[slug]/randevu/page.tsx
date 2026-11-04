import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getClinicByKey, parseHours, siteBase } from "@/lib/clinic";
import { PageHero } from "@/components/site/PageHero";
import { BookingWizard } from "@/components/site/BookingWizard";

export const metadata = { title: "Online Randevu" };

export default async function Booking({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ hizmet?: string; h?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const clinic = await getClinicByKey(slug);
  if (!clinic) notFound();
  const base = await siteBase(clinic);
  const [services, vets] = await Promise.all([
    db.service.findMany({ where: { clinicId: clinic.id, bookable: true }, orderBy: { order: "asc" } }),
    db.vet.findMany({ where: { clinicId: clinic.id, bookable: true }, orderBy: { order: "asc" } }),
  ]);
  const hours = parseHours(clinic.workingHours);
  const openDays = Object.entries(hours).filter(([, r]) => r.length).map(([d]) => Number(d));
  return (
    <>
      <PageHero title="Online Randevu" subtitle="4 kısa adım. Onaylandığında WhatsApp/SMS ile haber veriyoruz." pawType={clinic.pawType} />
      <section className="section section-tight">
        <div className="container narrow">
          <BookingWizard
            clinicId={clinic.id}
            clinicName={clinic.name}
            base={base}
            services={services.map((s) => ({ id: s.id, name: s.name, description: s.description, durationMin: s.durationMin, icon: s.icon, priceText: s.priceText }))}
            vets={vets.map((v) => ({ id: v.id, name: v.name, title: v.title, photoUrl: v.photoUrl }))}
            openDays={openDays}
            colors={[clinic.accentColor, clinic.primaryColor, clinic.goldColor]}
            pawType={clinic.pawType}
            whatsapp={clinic.whatsapp}
            initialService={services.some((s) => s.id === sp.hizmet) ? sp.hizmet : undefined}
            reminderToken={sp.h}
          />
        </div>
      </section>
    </>
  );
}
