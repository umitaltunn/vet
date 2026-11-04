import { db } from "./db";
import { normalizePhone } from "./phone";

type SendInput = {
  clinicId: string;
  to: string;
  toName?: string;
  body: string;
  kind: "ASI" | "RANDEVU" | "ONAY" | "TALEP" | "YORUM" | "BILGI";
  reminderId?: string;
  appointmentId?: string;
};

/**
 * Mesaj gonderim katmani.
 * SIMULE modunda mesaj sadece "Mesajlar" ekranina duser; panelden tek tikla
 * WhatsApp'ta acilip elle gonderilebilir. WHATSAPP_CLOUD modunda Meta'nin
 * WhatsApp Business Cloud API'si kullanilir.
 */
export async function sendMessage(input: SendInput) {
  const provider = process.env.MESSAGE_PROVIDER || "SIMULE";
  const phone = normalizePhone(input.to) ?? input.to;
  let status = "SIMULE";
  let error = "";

  if (provider === "WHATSAPP_CLOUD" && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: phone, type: "text", text: { body: input.body } }),
      });
      if (res.ok) status = "GONDERILDI";
      else {
        status = "HATA";
        error = (await res.text()).slice(0, 500);
      }
    } catch (e) {
      status = "HATA";
      error = String(e).slice(0, 500);
    }
  }

  return db.message.create({
    data: {
      clinicId: input.clinicId,
      to: phone,
      toName: input.toName ?? "",
      body: input.body,
      kind: input.kind,
      status,
      error,
      reminderId: input.reminderId,
      appointmentId: input.appointmentId,
    },
  });
}
