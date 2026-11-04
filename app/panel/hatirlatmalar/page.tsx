import Link from "next/link";
import { BellRing, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { fmtDate, fmtDateTime } from "@/lib/time";
import { waLink } from "@/lib/phone";
import { SubmitButton } from "@/components/panel/Buttons";
import { runRemindersAction, setReminderStatus } from "../actions";

export const dynamic = "force-dynamic";

const TYPE: Record<string, string> = { ASI: "Aşı", RANDEVU: "Randevu", YORUM: "Yorum" };
const ST: Record<string, [string, string]> = { GONDERILDI: ["Gönderildi", "b-warn"], RANDEVU_ALINDI: ["Randevu alındı", "b-ok"], IPTAL: ["Kapatıldı", "b-muted"] };

export default async function Reminders() {
  const { clinicId } = await requireClinicUser();
  const reminders = await db.reminder.findMany({
    where: { clinicId },
    include: { pet: { include: { owner: true } }, vaccination: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const asi = reminders.filter((r) => r.type === "ASI");
  const converted = asi.filter((r) => r.status === "RANDEVU_ALINDI").length;
  const rate = asi.length ? Math.round((converted / asi.length) * 100) : 0;
  return (
    <div className="pn-page">
      <header className="pn-head">
        <div>
          <h1>Hatırlatmalar</h1>
          <p className="muted">Aşı tarihinden 14 gün önce ve randevudan 1 gün önce otomatik mesaj gider. Her biri için tek mesaj atılır.</p>
        </div>
        <form action={runRemindersAction}><SubmitButton><BellRing size={16} /> Şimdi çalıştır</SubmitButton></form>
      </header>
      <div className="kpis">
        <div className="kpi"><strong>{asi.length}</strong><span>Aşı hatırlatması</span></div>
        <div className="kpi"><strong>{converted}</strong><span>Randevuya dönüşen</span></div>
        <div className="kpi kpi-hero"><strong>%{rate}</strong><span>Dönüşüm oranı</span></div>
      </div>
      <section className="pn-card">
        <table className="table">
          <thead><tr><th>Tür</th><th>Hasta</th><th>Konu</th><th>Tarih</th><th>Durum</th><th /></tr></thead>
          <tbody>
            {reminders.map((r) => {
              const msg = r.messages[0];
              return (
                <tr key={r.id}>
                  <td><span className="badge b-src">{TYPE[r.type] ?? r.type}</span></td>
                  <td>{r.pet ? <Link href={`/panel/hastalar/${r.pet.id}`}><strong>{r.pet.name}</strong></Link> : "-"}<small className="block muted">{r.pet?.owner.name}</small></td>
                  <td>{r.vaccination?.name ?? (r.type === "RANDEVU" ? "Yarınki randevu" : "-")}</td>
                  <td>{fmtDate(r.dueAt)}<small className="block muted">gönderim: {fmtDateTime(r.createdAt)}</small></td>
                  <td><span className={`badge ${ST[r.status]?.[1] ?? ""}`}>{ST[r.status]?.[0] ?? r.status}</span></td>
                  <td className="row-actions">
                    {msg && <a className="icon-btn" href={waLink(msg.to, msg.body)} target="_blank" rel="noreferrer" title="WhatsApp'ta aç"><MessageCircle size={16} /></a>}
                    {r.status === "GONDERILDI" && <form action={setReminderStatus.bind(null, r.id, "IPTAL")}><SubmitButton className="btn btn-sm btn-ghost">Kapat</SubmitButton></form>}
                  </td>
                </tr>
              );
            })}
            {reminders.length === 0 && <tr><td colSpan={6} className="empty">Henüz hatırlatma yok.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
