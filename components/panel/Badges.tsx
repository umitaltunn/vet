export const STATUS: Record<string, { label: string; cls: string }> = {
  BEKLIYOR: { label: "Onay bekliyor", cls: "b-warn" },
  ONAYLANDI: { label: "Onaylandı", cls: "b-ok" },
  TAMAMLANDI: { label: "Tamamlandı", cls: "b-done" },
  IPTAL: { label: "İptal", cls: "b-muted" },
  GELMEDI: { label: "Gelmedi", cls: "b-bad" },
};
export const SOURCE: Record<string, string> = { ONLINE: "Web sitesi", PANEL: "Panel", HATIRLATMA: "Hatırlatmadan" };

export function StatusBadge({ s }: { s: string }) {
  const x = STATUS[s] ?? { label: s, cls: "" };
  return <span className={`badge ${x.cls}`}>{x.label}</span>;
}

export function SourceBadge({ s }: { s: string }) {
  return <span className={`badge b-src ${s === "HATIRLATMA" ? "b-rem" : ""}`}>{SOURCE[s] ?? s}</span>;
}
