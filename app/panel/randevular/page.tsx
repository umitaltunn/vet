import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { addDays, fmtDayLabel, fmtDate, hm, todayKey, trDate } from "@/lib/time";
import { prettyPhone, waLink } from "@/lib/phone";
import { StatusBadge, SourceBadge, STATUS } from "@/components/panel/Badges";
import { SubmitButton } from "@/components/panel/Buttons";
import { createAppointment, setAppointmentStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function Appointments({ searchParams }: { searchParams: Promise<{ tarih?: string; durum?: string }> }) {
  const { clinicId } = await requireClinicUser();
  const sp = await searchParams;
  const day = /^\d{4}-\d{2}-\d{2}$/.test(sp.tarih ?? "") ? sp.tarih! : todayKey();
  const status = sp.durum && STATUS[sp.durum] ? sp.durum : null;

  const where = status
    ? { clinicId, status, ...(status === "BEKLIYOR" ? { startAt: { gte: trDate(todayKey()) } } : {}) }
    : { clinicId, startAt: { gte: trDate(day), lte: trDate(day, "23:59") } };
  const [list, pets, services, vets] = await Promise.all([
    db.appointment.findMany({ where, include: { service: true, vet: true }, orderBy: { startAt: "asc" }, take: 200 }),
    db.pet.findMany({ where: { clinicId }, include: { owner: true }, orderBy: { name: "asc" } }),
    db.service.findMany({ where: { clinicId }, orderBy: { order: "asc" } }),
    db.vet.findMany({ where: { clinicId }, orderBy: { order: "asc" } }),
  ]);

  // Haftalik mini gorunum: secili gunun etrafindaki 7 gunun randevu sayisi
  const week = Array.from({ length: 7 }, (_, i) => addDays(day, i - 3));
  const counts = await Promise.all(week.map((d) => db.appointment.count({ where: { clinicId, status: { not: "IPTAL" }, startAt: { gte: trDate(d), lte: trDate(d, "23:59") } } })));

  return (
    <div className="pn-page">
      <header className="pn-head">
        <div>
          <h1>Randevular</h1>
          <p className="muted">{status ? `${STATUS[status].label} durumundaki randevular` : fmtDayLabel(day)}</p>
        </div>
        <a href="#yeni" className="btn btn-primary"><Plus size={16} /> Yeni randevu</a>
      </header>

      <div className="pn-toolbar">
        <div className="day-nav">
          <Link className="icon-btn" href={`?tarih=${addDays(day, -1)}`}><ChevronLeft size={18} /></Link>
          {week.map((d, i) => (
            <Link key={d} href={`?tarih=${d}`} className={`day-pill ${d === day && !status ? "sel" : ""} ${d === todayKey() ? "today" : ""}`}>
              <small>{new Date(`${d}T12:00:00Z`).toLocaleDateString("tr-TR", { weekday: "short", timeZone: "UTC" })}</small>
              <strong>{new Date(`${d}T12:00:00Z`).getUTCDate()}</strong>
              {counts[i] > 0 && <span className="dp-count">{counts[i]}</span>}
            </Link>
          ))}
          <Link className="icon-btn" href={`?tarih=${addDays(day, 1)}`}><ChevronRight size={18} /></Link>
          <Link className="btn btn-sm btn-ghost" href="?">Bugün</Link>
        </div>
        <div className="tabs">
          <Link href={`?tarih=${day}`} className={!status ? "sel" : ""}>Gün görünümü</Link>
          {Object.entries(STATUS).map(([k, v]) => (
            <Link key={k} href={`?durum=${k}`} className={status === k ? "sel" : ""}>{v.label}</Link>
          ))}
        </div>
      </div>

      <section className="pn-card">
        {list.length === 0 && <p className="empty">Bu görünümde randevu yok.</p>}
        <div className="appt-table">
          {list.map((a) => (
            <div key={a.id} className={`appt-row st-${a.status}`}>
              <div className="ar-time">
                <Clock size={14} /> {hm(a.startAt)}–{hm(a.endAt)}
                {status && <small className="block">{fmtDate(a.startAt, { weekday: "short", year: undefined })}</small>}
              </div>
              <div className="ar-main">
                <strong>{a.petName}</strong> <small>{a.petSpecies}</small>
                <small className="block">{a.ownerName} · <a href={waLink(a.ownerPhone)} target="_blank" rel="noreferrer">{prettyPhone(a.ownerPhone)}</a></small>
                {a.note && <small className="block note">“{a.note}”</small>}
              </div>
              <div className="ar-svc">
                {a.service?.name ?? "-"}
                <small className="block">{a.vet?.name ?? "Hekim atanmadı"}</small>
              </div>
              <div className="ar-badges"><StatusBadge s={a.status} /><SourceBadge s={a.source} /></div>
              <div className="row-actions">
                {a.status === "BEKLIYOR" && <form action={setAppointmentStatus.bind(null, a.id, "ONAYLANDI")}><SubmitButton className="btn btn-sm btn-primary">Onayla</SubmitButton></form>}
                {a.status === "ONAYLANDI" && <form action={setAppointmentStatus.bind(null, a.id, "TAMAMLANDI")}><SubmitButton className="btn btn-sm btn-ghost">Tamamlandı</SubmitButton></form>}
                {a.status === "ONAYLANDI" && <form action={setAppointmentStatus.bind(null, a.id, "GELMEDI")}><SubmitButton className="btn btn-sm btn-ghost">Gelmedi</SubmitButton></form>}
                {(a.status === "BEKLIYOR" || a.status === "ONAYLANDI") && <form action={setAppointmentStatus.bind(null, a.id, "IPTAL")}><SubmitButton className="btn btn-sm btn-danger" confirm="Randevu iptal edilsin mi? Hasta sahibine bilgi mesajı gider.">İptal</SubmitButton></form>}
                {a.petId && <Link className="btn btn-sm btn-ghost" href={`/panel/hastalar/${a.petId}`}>Kart</Link>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pn-card" id="yeni">
        <h2>Yeni randevu (telefonla gelen)</h2>
        <p className="muted">Hasta kayıtlı değilse önce <Link href="/panel/hastalar#yeni">Hastalar</Link> sayfasından ekleyin.</p>
        <form action={createAppointment} className="form-grid">
          <label>Hasta
            <select name="petId" required defaultValue="">
              <option value="" disabled>Seçin…</option>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.species}) · {p.owner.name}</option>)}
            </select>
          </label>
          <label>Hizmet
            <select name="serviceId">{services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.durationMin} dk)</option>)}</select>
          </label>
          <label>Hekim
            <select name="vetId"><option value="">Atanmadı</option>{vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
          </label>
          <label>Tarih<input type="date" name="date" defaultValue={day} required /></label>
          <label>Saat<input type="time" name="time" step={300} defaultValue="10:00" required /></label>
          <label className="full">Not<input name="note" placeholder="Şikayet, hazırlık notu…" /></label>
          <div className="full"><SubmitButton><Plus size={16} /> Randevu oluştur</SubmitButton></div>
        </form>
      </section>
    </div>
  );
}
