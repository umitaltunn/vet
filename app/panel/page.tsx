import Link from "next/link";
import { ArrowRight, BellRing, CalendarCheck, CalendarClock, Check, Clock, MessageCircle, Sparkles, Syringe, X } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { runReminders } from "@/lib/reminders";
import { addDays, dayKey, fmtDate, fmtDayLabel, hm, todayKey, trDate } from "@/lib/time";
import { StatusBadge, SourceBadge } from "@/components/panel/Badges";
import { SubmitButton } from "@/components/panel/Buttons";
import { setAppointmentStatus, runRemindersAction } from "./actions";
import { WeekChart } from "@/components/panel/WeekChart";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { clinicId, user } = await requireClinicUser();
  // Panel her acildiginda hatirlatma motoru calisir (canlida: her sabah cron)
  const ran = await runReminders(clinicId);

  const today = todayKey();
  const monthStart = trDate(today.slice(0, 8) + "01");
  const [todays, pendingList, upcomingVacc, monthFromReminder, monthOnline, monthTotal, sentThisMonth, last14] = await Promise.all([
    db.appointment.findMany({ where: { clinicId, startAt: { gte: trDate(today), lte: trDate(today, "23:59") }, status: { not: "IPTAL" } }, include: { service: true, vet: true }, orderBy: { startAt: "asc" } }),
    db.appointment.findMany({ where: { clinicId, status: "BEKLIYOR", startAt: { gte: new Date() } }, include: { service: true }, orderBy: { startAt: "asc" }, take: 6 }),
    db.vaccination.findMany({ where: { clinicId, nextDueAt: { gte: trDate(addDays(today, -30)), lte: trDate(addDays(today, 14), "23:59") } }, include: { pet: { include: { owner: true } }, reminders: true }, orderBy: { nextDueAt: "asc" }, take: 8 }),
    db.appointment.count({ where: { clinicId, source: "HATIRLATMA", createdAt: { gte: monthStart } } }),
    db.appointment.count({ where: { clinicId, source: "ONLINE", createdAt: { gte: monthStart } } }),
    db.appointment.count({ where: { clinicId, createdAt: { gte: monthStart } } }),
    db.message.count({ where: { clinicId, createdAt: { gte: monthStart } } }),
    db.appointment.findMany({ where: { clinicId, startAt: { gte: trDate(addDays(today, -13)), lte: trDate(today, "23:59") }, status: { not: "IPTAL" } }, select: { startAt: true, source: true } }),
  ]);

  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const chart = days.map((d) => {
    const list = last14.filter((a) => dayKey(a.startAt) === d);
    return { day: d, total: list.length, reminder: list.filter((a) => a.source === "HATIRLATMA").length, online: list.filter((a) => a.source === "ONLINE").length };
  });

  const hour = Number(hm(new Date()).slice(0, 2));
  const greet = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  return (
    <div className="pn-page">
      <header className="pn-head">
        <div>
          <h1>{greet}, {user.name.split(" ").slice(0, 2).join(" ")}</h1>
          <p className="muted">{fmtDayLabel(today)} · Bugün {todays.length} randevu var.</p>
        </div>
        <form action={runRemindersAction}>
          <SubmitButton className="btn btn-ghost"><BellRing size={16} /> Hatırlatmaları çalıştır</SubmitButton>
        </form>
      </header>

      {(ran.vaccines > 0 || ran.appointments > 0) && (
        <div className="pn-flash">
          <Sparkles size={18} /> Hatırlatma motoru az önce {ran.vaccines > 0 && `${ran.vaccines} aşı`}{ran.vaccines > 0 && ran.appointments > 0 && " ve "}{ran.appointments > 0 && `${ran.appointments} randevu`} hatırlatması gönderdi.
          <Link href="/panel/mesajlar">Mesajları gör</Link>
        </div>
      )}

      <div className="kpis">
        <div className="kpi kpi-hero">
          <span className="kpi-icon"><BellRing /></span>
          <strong>{monthFromReminder}</strong>
          <span>Bu ay hatırlatmadan gelen randevu</span>
          <small>Bu hastalar hatırlatma olmasa büyük ihtimalle gelmeyecekti.</small>
        </div>
        <div className="kpi"><span className="kpi-icon"><CalendarCheck /></span><strong>{monthOnline}</strong><span>Bu ay web sitesinden randevu</span></div>
        <div className="kpi"><span className="kpi-icon"><CalendarClock /></span><strong>{monthTotal}</strong><span>Bu ay toplam randevu</span></div>
        <div className="kpi"><span className="kpi-icon"><MessageCircle /></span><strong>{sentThisMonth}</strong><span>Bu ay gönderilen mesaj</span></div>
      </div>

      <div className="pn-grid">
        <section className="pn-card span-2">
          <div className="pn-card-head"><h2>Son 14 gün</h2><span className="legend"><i className="lg-total" /> Toplam <i className="lg-rem" /> Hatırlatmadan <i className="lg-web" /> Web sitesinden</span></div>
          <WeekChart data={chart} />
        </section>

        <section className="pn-card">
          <div className="pn-card-head"><h2>Onay bekleyenler</h2><Link href="/panel/randevular?durum=BEKLIYOR">Tümü <ArrowRight size={14} /></Link></div>
          {pendingList.length === 0 && <p className="empty">Bekleyen talep yok. Harika!</p>}
          <ul className="pn-list">
            {pendingList.map((a) => (
              <li key={a.id}>
                <div>
                  <strong>{a.petName}</strong> <small>({a.ownerName})</small>
                  <small className="block">{fmtDate(a.startAt, { weekday: "short", year: undefined })} {hm(a.startAt)} · {a.service?.name}</small>
                  <SourceBadge s={a.source} />
                </div>
                <div className="row-actions">
                  <form action={setAppointmentStatus.bind(null, a.id, "ONAYLANDI")}><SubmitButton className="icon-btn ok" title="Onayla"><Check size={16} /></SubmitButton></form>
                  <form action={setAppointmentStatus.bind(null, a.id, "IPTAL")}><SubmitButton className="icon-btn bad" title="Reddet" confirm="Bu randevu iptal edilsin mi? Hasta sahibine mesaj gidecek."><X size={16} /></SubmitButton></form>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="pn-card span-2">
          <div className="pn-card-head"><h2>Bugünün randevuları</h2><Link href="/panel/randevular">Takvim <ArrowRight size={14} /></Link></div>
          {todays.length === 0 && <p className="empty">Bugün için randevu yok.</p>}
          <div className="timeline">
            {todays.map((a) => (
              <div key={a.id} className={`tl-item st-${a.status}`}>
                <span className="tl-time"><Clock size={14} /> {hm(a.startAt)}</span>
                <div className="tl-body">
                  <strong>{a.petName}</strong> <small>{a.petSpecies} · {a.ownerName}</small>
                  <small className="block">{a.service?.name}{a.vet ? ` · ${a.vet.name}` : ""}</small>
                  {a.note && <small className="block note">“{a.note}”</small>}
                </div>
                <div className="tl-right">
                  <StatusBadge s={a.status} />
                  {a.status === "ONAYLANDI" && (
                    <form action={setAppointmentStatus.bind(null, a.id, "TAMAMLANDI")}><SubmitButton className="btn btn-sm btn-ghost">Tamamlandı</SubmitButton></form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pn-card">
          <div className="pn-card-head"><h2>Yaklaşan aşılar</h2><Link href="/panel/hatirlatmalar">Hatırlatmalar <ArrowRight size={14} /></Link></div>
          {upcomingVacc.length === 0 && <p className="empty">Önümüzdeki 14 günde aşı yok.</p>}
          <ul className="pn-list">
            {upcomingVacc.map((v) => {
              const late = v.nextDueAt! < new Date();
              return (
                <li key={v.id}>
                  <div>
                    <Link href={`/panel/hastalar/${v.petId}`}><strong>{v.pet.name}</strong></Link> <small>· {v.name}</small>
                    <small className={`block ${late ? "txt-bad" : ""}`}><Syringe size={12} /> {late ? "Gecikti: " : ""}{fmtDate(v.nextDueAt)}</small>
                  </div>
                  {v.reminders.length > 0 ? <span className="badge b-ok">Hatırlatıldı</span> : <span className="badge b-muted">Sırada</span>}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
