import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PatiPanel · Veteriner klinikleri için web sitesi, randevu ve hatırlatma",
  description: "Kliniğinize özel pati animasyonlu web sitesi, online randevu, WhatsApp aşı hatırlatma ve Google yorum toplama.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
