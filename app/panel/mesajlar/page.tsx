import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/time";
import { prettyPhone, waLink } from "@/lib/phone";

export const dynamic = "force-dynamic";

const KIND: Record<string, string> = { ASI: "Aşı hatırlatma", RANDEVU: "Randevu hatırlatma", ONAY: "Randevu onayı", TALEP: "Talep alındı", YORUM: "Yorum isteği", BILGI: "Bilgi" };

export default async function Messages() {
  const { clinicId } = await requireClinicUser();
  const messages = await db.message.findMany({ where: { clinicId }, orderBy: { createdAt: "desc" }, take: 200 });
  const simulated = (process.env.MESSAGE_PROVIDER || "SIMULE") === "SIMULE";
  return (
    <div className="pn-page">
      <header className="pn-head">
        <div>
          <h1>Mesajlar</h1>
          <p className="muted">Sistemin hasta sahiplerine gönderdiği tüm WhatsApp/SMS mesajları.</p>
        </div>
      </header>
      {simulated && (
        <div className="pn-flash info">
          Simülasyon modundasınız: mesajlar gerçekten gönderilmiyor, burada listeleniyor. Her mesajı WhatsApp simgesiyle elle gönderebilirsiniz. Otomatik gönderim için README&apos;deki WhatsApp Cloud API ayarına bakın.
        </div>
      )}
      <div className="msg-list">
        {messages.map((m) => (
          <div key={m.id} className="msg">
            <div className="msg-head">
              <span className="badge b-src">{KIND[m.kind] ?? m.kind}</span>
              <strong>{m.toName || prettyPhone(m.to)}</strong>
              <small className="muted">{prettyPhone(m.to)} · {fmtDateTime(m.createdAt)}</small>
              <span className={`badge ${m.status === "HATA" ? "b-bad" : m.status === "GONDERILDI" ? "b-ok" : "b-muted"}`}>{m.status === "SIMULE" ? "Simüle" : m.status === "GONDERILDI" ? "Gönderildi" : "Hata"}</span>
              <a className="icon-btn" href={waLink(m.to, m.body)} target="_blank" rel="noreferrer" title="WhatsApp'ta aç"><MessageCircle size={16} /></a>
            </div>
            <p className="msg-body">{m.body}</p>
            {m.error && <small className="txt-bad">{m.error}</small>}
          </div>
        ))}
        {messages.length === 0 && <p className="empty">Henüz mesaj yok.</p>}
      </div>
    </div>
  );
}
