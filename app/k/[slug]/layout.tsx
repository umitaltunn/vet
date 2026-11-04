import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClinicByKey, siteBase, themeVars } from "@/lib/clinic";
import { PawTransitionProvider } from "@/components/fx/PawTransition";
import { CursorPaws } from "@/components/fx/CursorPaws";
import { ScrollPawTrail } from "@/components/fx/ScrollPawTrail";
import { PeekingPet } from "@/components/fx/Motion";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MobileBar } from "@/components/site/MobileBar";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const c = await getClinicByKey(slug);
  if (!c) return { title: "Klinik bulunamadı" };
  return {
    title: { default: `${c.name} · ${c.city}`, template: `%s · ${c.name}` },
    description: c.tagline,
    icons: c.logoUrl ? [{ url: c.logoUrl }] : undefined,
    openGraph: { title: c.name, description: c.tagline, images: c.logoUrl ? [c.logoUrl] : [] },
  };
}

export default async function ClinicLayout({ children, params }: P & { children: React.ReactNode }) {
  const { slug } = await params;
  const clinic = await getClinicByKey(slug);
  if (!clinic) notFound();
  const base = await siteBase(clinic);
  const colors = [clinic.accentColor, clinic.primaryColor, clinic.goldColor];
  const level = clinic.animationLevel;

  // Arama motorlari icin yapisal veri (Google'da klinik karti)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    name: clinic.name,
    description: clinic.tagline,
    telephone: clinic.phone,
    email: clinic.email,
    image: clinic.logoUrl,
    address: { "@type": "PostalAddress", streetAddress: clinic.address, addressLocality: clinic.city, addressCountry: "TR" },
  };

  return (
    <div className={`site theme-${clinic.theme} anim-${level}`} style={themeVars(clinic)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PawTransitionProvider pawType={clinic.pawType} level={level} logoUrl={clinic.logoUrl} name={clinic.name}>
        {clinic.emergencyPhone && (
          <div className="emergency-bar">
            <span className="pulse-dot" /> Acil durum 7/24: <a href={`tel:${clinic.emergencyPhone.replace(/\s/g, "")}`}>{clinic.emergencyPhone}</a>
          </div>
        )}
        <SiteHeader base={base} name={clinic.name} logoUrl={clinic.logoUrl} phone={clinic.phone} pawType={clinic.pawType} />
        <main className="site-main">{children}</main>
        <SiteFooter clinic={clinic} base={base} />
        <MobileBar base={base} phone={clinic.phone} whatsapp={clinic.whatsapp} name={clinic.name} />
        {clinic.cursorTrail && level !== "sakin" && <CursorPaws pawType={clinic.pawType} color={clinic.accentColor} />}
        {level === "coskulu" && <ScrollPawTrail pawType={clinic.pawType} />}
        {level !== "sakin" && <PeekingPet pawType={clinic.pawType} colors={colors} message="Aşı zamanını unutma! 🐾" />}
      </PawTransitionProvider>
    </div>
  );
}
