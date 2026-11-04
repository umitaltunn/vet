import { Plus, Trash2, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { SubmitButton } from "@/components/panel/Buttons";
import { deleteVet, saveVet } from "../actions";
import type { Vet } from "@prisma/client";

export const dynamic = "force-dynamic";

function VetForm({ v }: { v?: Vet }) {
  return (
    <form action={saveVet} className="form-grid">
      {v && <input type="hidden" name="id" value={v.id} />}
      <label>Ad soyad<input name="name" defaultValue={v?.name} required placeholder="Dr. Ad Soyad" /></label>
      <label>Ünvan<input name="title" defaultValue={v?.title ?? "Veteriner Hekim"} /></label>
      <label>Fotoğraf<input type="file" name="photo" accept="image/*" /></label>
      <label>Sıra<input type="number" name="order" defaultValue={v?.order ?? 0} /></label>
      <label className="check"><input type="checkbox" name="bookable" defaultChecked={v?.bookable ?? true} /> <span>Online randevu alabilir</span></label>
      <label className="full">Kısa biyografi<textarea name="bio" rows={2} defaultValue={v?.bio} /></label>
      <div className="full"><SubmitButton>{v ? "Kaydet" : <><Plus size={16} /> Hekim ekle</>}</SubmitButton></div>
    </form>
  );
}

export default async function Team() {
  const { clinicId } = await requireClinicUser();
  const vets = await db.vet.findMany({ where: { clinicId }, orderBy: { order: "asc" } });
  return (
    <div className="pn-page">
      <header className="pn-head"><div><h1>Ekip</h1><p className="muted">Hekimler sitede ve randevu ekranında görünür.</p></div></header>
      {vets.map((v) => (
        <details key={v.id} className="pn-card collapsible">
          <summary>
            <span className="mini-avatar">{v.photoUrl ? <img src={v.photoUrl} alt="" /> : <UserRound size={18} />}</span>
            <strong>{v.name}</strong> <small className="muted">{v.title}</small>
          </summary>
          <VetForm v={v} />
          <form action={deleteVet.bind(null, v.id)} className="danger-zone"><SubmitButton className="btn btn-sm btn-danger" confirm="Hekim silinsin mi?"><Trash2 size={14} /> Sil</SubmitButton></form>
        </details>
      ))}
      <section className="pn-card"><h2>Yeni hekim</h2><VetForm /></section>
    </div>
  );
}
