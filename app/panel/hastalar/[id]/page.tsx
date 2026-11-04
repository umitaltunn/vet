import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft, ExternalLink, MessageCircle, Plus, Syringe, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { publicSiteUrl } from "@/lib/clinic";
import { ageText, dayKey, fmtDate, fmtDateTime, todayKey } from "@/lib/time";
import { prettyPhone, waLink } from "@/lib/phone";
import { VACCINES } from "@/lib/vaccines";
import { Paw } from "@/components/fx/Paw";
import { StatusBadge } from "@/components/panel/Badges";
import { SubmitButton } from "@/components/panel/Buttons";
import { addVaccination, deletePet, deleteVaccination, updatePet } from "../../actions";

export const dynamic = "force-dynamic";

export default async function PetDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clinicId, clinic } = await requireClinicUser();
  const pet = await db.pet.findFirst({
    where: { id, clinicId },
    include: { owner: { include: { pets: true } }, vaccinations: { orderBy: { givenAt: "desc" } }, appointments: { include: { service: true }, orderBy: { startAt: "desc" }, take: 20 } },
  });
  if (!pet) notFound();
  const vets = await db.vet.findMany({ where: { clinicId }, orderBy: { order: "asc" } });
  const cardUrl = `${publicSiteUrl(clinic)}/karne/${pet.cardToken}`;
  const localCard = `/k/${clinic.slug}/karne/${pet.cardToken}`;
  const qr = await QRCode.toDataURL(cardUrl, { margin: 1, width: 160 });
  const kind = pet.species === "Köpek" ? "kopek" : pet.species === "Kuş" ? "kus" : "kedi";
  const now = new Date();
  const shareText = `Merhaba ${pet.owner.name}, ${pet.name} için dijital aşı karnesi: ${cardUrl}\n${clinic.name}`;

  return (
    <div className="pn-page">
      <Link href="/panel/hastalar" className="back"><ArrowLeft size={16} /> Hastalar</Link>
      <header className="pn-head pet-head">
        <div className="pet-title">
          <span className={`pet-avatar big sp-${kind}`}><Paw kind={kind} size={40} /></span>
          <div>
            <h1>{pet.name}</h1>
            <p className="muted">{[pet.species, pet.breed, pet.sex, ageText(pet.birthDate), pet.neutered ? "Kısır" : ""].filter(Boolean).join(" · ")}</p>
            <p>{pet.owner.name} · <a href={waLink(pet.owner.phone)} target="_blank" rel="noreferrer">{prettyPhone(pet.owner.phone)}</a> {pet.owner.kvkkConsent ? <span className="badge b-ok">KVKK onaylı</span> : <span className="badge b-bad">KVKK onayı yok</span>}</p>
          </div>
        </div>
        <div className="qr-box">
          <img src={qr} alt="Aşı karnesi QR" />
          <div>
            <strong>Dijital aşı karnesi</strong>
            <a href={localCard} target="_blank" className="btn btn-sm btn-ghost"><ExternalLink size={14} /> Aç</a>
            <a href={waLink(pet.owner.phone, shareText)} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost"><MessageCircle size={14} /> Sahibine gönder</a>
          </div>
        </div>
      </header>

      <div className="pn-grid">
        <section className="pn-card span-2">
          <div className="pn-card-head"><h2><Syringe size={18} /> Aşılar</h2></div>
          <table className="table">
            <thead><tr><th>Aşı</th><th>Yapıldı</th><th>Sonraki</th><th>Hekim</th><th /></tr></thead>
            <tbody>
              {pet.vaccinations.map((v) => (
                <tr key={v.id}>
                  <td><strong>{v.name}</strong>{v.notes && <small className="block muted">{v.notes}</small>}</td>
                  <td>{fmtDate(v.givenAt)}</td>
                  <td className={v.nextDueAt && v.nextDueAt < now ? "txt-bad" : ""}>{v.nextDueAt ? fmtDate(v.nextDueAt) : "-"}</td>
                  <td>{v.vetName || "-"}</td>
                  <td><form action={deleteVaccination.bind(null, v.id, pet.id)}><SubmitButton className="icon-btn bad" confirm="Aşı kaydı silinsin mi?" title="Sil"><Trash2 size={14} /></SubmitButton></form></td>
                </tr>
              ))}
              {pet.vaccinations.length === 0 && <tr><td colSpan={5} className="empty">Henüz aşı kaydı yok.</td></tr>}
            </tbody>
          </table>
          <form action={addVaccination.bind(null, pet.id)} className="form-grid inline-form">
            <label>Aşı
              <select name="name" defaultValue="">
                <option value="">Listeden seçin…</option>
                {VACCINES.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.days} gün)</option>)}
              </select>
            </label>
            <label>ya da başka aşı<input name="customName" placeholder="Aşı adı" /></label>
            <label>Yapılma tarihi<input type="date" name="givenAt" defaultValue={todayKey()} required /></label>
            <label>Tekrar (gün)<input type="number" name="intervalDays" placeholder="Listeden otomatik" min={0} /></label>
            <label>Hekim<select name="vetName">{vets.map((v) => <option key={v.id}>{v.name}</option>)}</select></label>
            <label>Not<input name="notes" placeholder="Seri no, reaksiyon…" /></label>
            <div className="full"><SubmitButton><Plus size={16} /> Aşı ekle</SubmitButton> <small className="muted">Sonraki tarih yaklaşınca sahibine otomatik WhatsApp hatırlatması gider.</small></div>
          </form>
        </section>

        <section className="pn-card">
          <h2>Randevu geçmişi</h2>
          <ul className="pn-list">
            {pet.appointments.map((a) => (
              <li key={a.id}><div><strong>{a.service?.name ?? "Randevu"}</strong><small className="block">{fmtDateTime(a.startAt)}</small></div><StatusBadge s={a.status} /></li>
            ))}
            {pet.appointments.length === 0 && <p className="empty">Randevu yok.</p>}
          </ul>
          {pet.owner.pets.length > 1 && (
            <>
              <h3 className="mt">Aynı ailenin diğer dostları</h3>
              <div className="chips">{pet.owner.pets.filter((p) => p.id !== pet.id).map((p) => <Link key={p.id} href={`/panel/hastalar/${p.id}`} className="chip">{p.name}</Link>)}</div>
            </>
          )}
        </section>

        <section className="pn-card span-3">
          <h2>Bilgileri düzenle</h2>
          <form action={updatePet.bind(null, pet.id)} className="form-grid">
            <label>Adı<input name="name" defaultValue={pet.name} required /></label>
            <label>Tür<select name="species" defaultValue={pet.species}>{["Kedi", "Köpek", "Kuş", "Tavşan", "Diğer"].map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Irk<input name="breed" defaultValue={pet.breed} /></label>
            <label>Cinsiyet<select name="sex" defaultValue={pet.sex}><option value="">-</option><option>Dişi</option><option>Erkek</option></select></label>
            <label>Doğum tarihi<input type="date" name="birthDate" defaultValue={pet.birthDate ? dayKey(pet.birthDate) : ""} /></label>
            <label>Renk<input name="color" defaultValue={pet.color} /></label>
            <label>Çip no<input name="chipNo" defaultValue={pet.chipNo} /></label>
            <label className="check"><input type="checkbox" name="neutered" defaultChecked={pet.neutered} /> <span>Kısırlaştırılmış</span></label>
            <label>Sahip adı<input name="ownerName" defaultValue={pet.owner.name} /></label>
            <label>Sahip telefonu<input name="ownerPhone" defaultValue={prettyPhone(pet.owner.phone)} /></label>
            <label>Sahip e-posta<input name="ownerEmail" defaultValue={pet.owner.email} /></label>
            <label className="full">Notlar (alerji, davranış, kronik hastalık)<textarea name="notes" rows={3} defaultValue={pet.notes} /></label>
            <div className="full row-between">
              <SubmitButton>Kaydet</SubmitButton>
            </div>
          </form>
          <form action={deletePet.bind(null, pet.id)} className="danger-zone">
            <SubmitButton className="btn btn-danger btn-sm" confirm={`${pet.name} ve tüm aşı kayıtları kalıcı olarak silinsin mi?`}><Trash2 size={14} /> Hastayı sil</SubmitButton>
          </form>
        </section>
      </div>
    </div>
  );
}
