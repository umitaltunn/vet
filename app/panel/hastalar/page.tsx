import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { ageText, fmtDate } from "@/lib/time";
import { prettyPhone } from "@/lib/phone";
import { Paw } from "@/components/fx/Paw";
import { SubmitButton } from "@/components/panel/Buttons";
import { createPatient } from "../actions";

export const dynamic = "force-dynamic";

export default async function Patients({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { clinicId } = await requireClinicUser();
  const { q = "" } = await searchParams;
  const term = q.trim();
  const digits = term.replace(/\D/g, "");
  const pets = await db.pet.findMany({
    where: {
      clinicId,
      ...(term ? { OR: [{ name: { contains: term } }, { breed: { contains: term } }, { chipNo: { contains: term } }, { owner: { name: { contains: term } } }, ...(digits.length >= 3 ? [{ owner: { phone: { contains: digits } } }] : [])] } : {}),
    },
    include: { owner: true, vaccinations: { orderBy: { nextDueAt: "asc" }, where: { nextDueAt: { not: null } } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const now = new Date();
  return (
    <div className="pn-page">
      <header className="pn-head">
        <div><h1>Hastalar</h1><p className="muted">{pets.length} kayıt</p></div>
        <a href="#yeni" className="btn btn-primary"><Plus size={16} /> Yeni hasta</a>
      </header>
      <form className="search-bar">
        <Search size={18} />
        <input name="q" defaultValue={q} placeholder="İsim, sahip, telefon, çip no ile ara…" />
      </form>
      <div className="pet-grid">
        {pets.map((p) => {
          const next = p.vaccinations.find((v) => v.nextDueAt);
          const late = p.vaccinations.some((v) => v.nextDueAt! < now);
          return (
            <Link key={p.id} href={`/panel/hastalar/${p.id}`} className="pet-card">
              <span className={`pet-avatar sp-${p.species === "Köpek" ? "kopek" : p.species === "Kuş" ? "kus" : "kedi"}`}>
                <Paw kind={p.species === "Köpek" ? "kopek" : p.species === "Kuş" ? "kus" : "kedi"} size={26} />
              </span>
              <div>
                <strong>{p.name}</strong>
                <small className="block">{[p.species, p.breed, ageText(p.birthDate)].filter(Boolean).join(" · ")}</small>
                <small className="block muted">{p.owner.name} · {prettyPhone(p.owner.phone)}</small>
                {next && <small className={`block ${late ? "txt-bad" : "txt-ok"}`}>{late ? "Geciken aşı var" : `Sıradaki aşı: ${fmtDate(next.nextDueAt, { year: undefined })}`}</small>}
              </div>
            </Link>
          );
        })}
        {pets.length === 0 && <p className="empty">Kayıt bulunamadı.</p>}
      </div>

      <section className="pn-card" id="yeni">
        <h2>Yeni hasta kaydı</h2>
        <p className="muted">Aynı telefon numarasıyla kayıtlı sahip varsa yeni hayvan onun altına eklenir.</p>
        <form action={createPatient} className="form-grid">
          <label>Sahip adı soyadı<input name="ownerName" required /></label>
          <label>Telefon<input name="phone" type="tel" required placeholder="05xx xxx xx xx" /></label>
          <label>E-posta<input name="email" type="email" /></label>
          <label>Hayvanın adı<input name="petName" required /></label>
          <label>Tür<select name="species">{["Kedi", "Köpek", "Kuş", "Tavşan", "Diğer"].map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Irk<input name="breed" /></label>
          <label>Cinsiyet<select name="sex"><option value="">-</option><option>Dişi</option><option>Erkek</option></select></label>
          <label>Doğum tarihi<input name="birthDate" type="date" /></label>
          <label>Çip no<input name="chipNo" /></label>
          <label className="check full"><input type="checkbox" name="kvkk" defaultChecked /> <span>Sahibinden KVKK açık rızası ve WhatsApp/SMS ile hatırlatma izni alındı.</span></label>
          <div className="full"><SubmitButton><Plus size={16} /> Kaydet</SubmitButton></div>
        </form>
      </section>
    </div>
  );
}
