import { Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { SERVICE_ICONS, ServiceIcon } from "@/components/site/Icon";
import { SubmitButton } from "@/components/panel/Buttons";
import { deleteService, saveService } from "../actions";
import type { Service } from "@prisma/client";

export const dynamic = "force-dynamic";

function ServiceForm({ s }: { s?: Service }) {
  return (
    <form action={saveService} className="form-grid svc-form">
      {s && <input type="hidden" name="id" value={s.id} />}
      <label>Ad<input name="name" defaultValue={s?.name} required /></label>
      <label>Simge<select name="icon" defaultValue={s?.icon ?? "stethoscope"}>{Object.keys(SERVICE_ICONS).map((k) => <option key={k}>{k}</option>)}</select></label>
      <label>Süre (dk)<input type="number" name="durationMin" min={5} step={5} defaultValue={s?.durationMin ?? 30} /></label>
      <label>Fiyat metni<input name="priceText" defaultValue={s?.priceText} placeholder="750 TL / Ön görüşmeyle" /></label>
      <label>Sıra<input type="number" name="order" defaultValue={s?.order ?? 0} /></label>
      <label className="check"><input type="checkbox" name="bookable" defaultChecked={s?.bookable ?? true} /> <span>Online randevuya açık</span></label>
      <label className="full">Açıklama<textarea name="description" rows={2} defaultValue={s?.description} /></label>
      <div className="full"><SubmitButton>{s ? "Kaydet" : <><Plus size={16} /> Hizmet ekle</>}</SubmitButton></div>
    </form>
  );
}

export default async function Services() {
  const { clinicId } = await requireClinicUser();
  const services = await db.service.findMany({ where: { clinicId }, orderBy: { order: "asc" } });
  return (
    <div className="pn-page">
      <header className="pn-head"><div><h1>Hizmetler</h1><p className="muted">Sitede görünen hizmetler ve randevu süreleri.</p></div></header>
      {services.map((s) => (
        <details key={s.id} className="pn-card collapsible">
          <summary>
            <span className="svc-ico"><ServiceIcon name={s.icon} size={20} /></span>
            <strong>{s.name}</strong> <small className="muted">{s.durationMin} dk {s.priceText && `· ${s.priceText}`}</small>
            {!s.bookable && <span className="badge b-muted">Randevuya kapalı</span>}
          </summary>
          <ServiceForm s={s} />
          <form action={deleteService.bind(null, s.id)} className="danger-zone"><SubmitButton className="btn btn-sm btn-danger" confirm="Hizmet silinsin mi?"><Trash2 size={14} /> Sil</SubmitButton></form>
        </details>
      ))}
      <section className="pn-card"><h2>Yeni hizmet</h2><ServiceForm /></section>
    </div>
  );
}
