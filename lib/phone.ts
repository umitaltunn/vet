/** Turk telefon numarasini 905XXXXXXXXX bicimine getirir. Gecersizse null. */
export function normalizePhone(input: string): string | null {
  let d = (input || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  if (d.length === 11 && d.startsWith("0")) d = "9" + d;
  if (d.length === 12 && d.startsWith("90")) return d;
  return null;
}

export function prettyPhone(p: string): string {
  const d = normalizePhone(p);
  if (!d) return p;
  return `0${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

export function waLink(phone: string, text?: string): string {
  const d = normalizePhone(phone) ?? phone.replace(/\D/g, "");
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
