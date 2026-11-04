import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CalendarClock, CheckCircle2, AlertTriangle, Syringe } from "lucide-react";
import { db } from "@/lib/db";
import { getClinicByKey, publicSiteUrl, siteBase } from "@/lib/clinic";
import { ageText, fmtDate } from "@/lib/time";
import { Paw, pickPaw } from "@/components/fx/Paw";
import { Reveal } from "@/components/fx/Motion";
import { PawLink } from "@/components/fx/PawTransition";

export const metadata = { title: "Dijital Aşı Karnesi", robots: { index: false } };

export default async function VaccineCard({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const { slug, token } = await params;
  const clinic = await getClinicByKey(slug);
  if (!clinic) notFound();
  const base = await siteBase(clinic);
  const pet = await db.pet.findFirst({
    where: { cardToken: token, clinicId: clinic.id },
    include: { owner: true, vaccinations: { orderBy: { givenAt: "desc" } } },
  });
  if (!pet) notFound();
  const url = `${publicSiteUrl(clinic)}/karne/${pet.cardToken}`;
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: clinic.darkColor === "#ECFDF5" ? "#0B1F1A" : clinic.darkColor, light: "#ffffff" } });
  const now = new Date();
  // Her asi turunun en guncel kaydi
  const latest = new Map<string, (typeof pet.vaccinations)[number]>();
  for (const v of pet.vaccinations) if (!latest.has(v.name)) latest.set(v.name, v);

  return (
    <section className="section">
      <div className="container narrow">
        <Reveal>
          <div className="vcard">
            <div className="vcard-head">
              <div className="vcard-pet">
                <span className="vcard-avatar"><Paw kind={pet.species === "Köpek" ? "kopek" : pet.species === "Kuş" ? "kus" : "kedi"} size={44} /></span>
                <div>
                  <small>Dijital Aşı Karnesi</small>
                  <h1>{pet.name}</h1>
                  <p>{[pet.species, pet.breed, pet.sex, ageText(pet.birthDate)].filter(Boolean).join(" · ")}</p>
                  {pet.chipNo && <p className="muted">Çip no: {pet.chipNo}</p>}
                </div>
              </div>
              <div className="vcard-qr">
                <img src={qr} alt="QR kod" />
                <small>Telefonunuza kaydedin</small>
              </div>
            </div>
            <h3 className="vcard-sub">Güncel durum</h3>
            <div className="vstatus">
              {[...latest.values()].map((v) => {
                const late = v.nextDueAt && v.nextDueAt < now;
                const soon = v.nextDueAt && !late && v.nextDueAt.getTime() - now.getTime() < 14 * 864e5;
                return (
                  <div key={v.id} className={`vs ${late ? "late" : soon ? "soon" : "ok"}`}>
                    {late ? <AlertTriangle size={18} /> : soon ? <CalendarClock size={18} /> : <CheckCircle2 size={18} />}
                    <div>
                      <strong>{v.name}</strong>
                      <small>{v.nextDueAt ? (late ? `Gecikti: ${fmtDate(v.nextDueAt)}` : `Sonraki: ${fmtDate(v.nextDueAt)}`) : "Tekrar gerekmiyor"}</small>
                    </div>
                  </div>
                );
              })}
              {latest.size === 0 && <p className="muted">Henüz aşı kaydı yok.</p>}
            </div>
            <h3 className="vcard-sub">Aşı geçmişi</h3>
            <table className="vtable">
              <thead><tr><th>Aşı</th><th>Tarih</th><th>Hekim</th></tr></thead>
              <tbody>
                {pet.vaccinations.map((v) => (
                  <tr key={v.id}><td><Syringe size={14} /> {v.name}</td><td>{fmtDate(v.givenAt)}</td><td>{v.vetName || "-"}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="vcard-foot">
              <span>{clinic.name} · {clinic.phone}</span>
              <PawLink href={`${base}/randevu`} className="btn btn-primary btn-sm">Randevu al</PawLink>
            </div>
            <span className="vcard-bgpaw" aria-hidden><Paw kind={pickPaw(clinic.pawType)} size={260} /></span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
