# PatiPanel

Veteriner klinikleri için hepsi bir arada platform: kliniğe özel, pati animasyonlu web sitesi, 7/24 online randevu, otomatik WhatsApp aşı hatırlatma, QR kodlu dijital aşı karnesi ve sade bir klinik paneli.

Tek kod ve tek veritabanı ile istediğiniz kadar klinik çalışır. 2. ya da 50. klinik için yeni sunucu, yeni hosting, yeni veritabanı açılmaz. Sadece panelden "yeni klinik" eklenir.

---

## Windows'ta hızlı başlangıç

1. **Node.js kurun** (bir kez): https://nodejs.org adresinden **LTS** sürümünü indirip kurun (20 veya üstü).
2. Zip'i bir klasöre çıkarın.
3. **`baslat.bat`** dosyasına çift tıklayın.

İlk açılışta paketler indirilir (1-3 dakika), veritabanı oluşturulur ve demo veriler yüklenir. Ardından tarayıcı kendiliğinden `http://localhost:3000` adresini açar. Kapatmak için siyah pencerede `Ctrl+C`.

| Dosya | Ne yapar |
| --- | --- |
| `baslat.bat` | Geliştirme modunda başlatır. Kodda değişiklik yaparsanız sayfa anında yenilenir. |
| `uretim-baslat.bat` | Önce derler (1-2 dk), sonra çok hızlı çalışan üretim sürümünü açar. Müşteriye demo için ideal. |
| `sifirla.bat` | Tüm verileri silip demo verileri yeniden yükler (onay ister). |

macOS / Linux: `npm install && cp .env.example .env && npx prisma db push && npm run seed && npm run dev`

## Adresler ve demo hesaplar

| Adres | Ne var |
| --- | --- |
| http://localhost:3000 | PatiPanel tanıtım sayfası (kliniklere satış sayfası) |
| http://localhost:3000/k/patidostu | Demo klinik sitesi (Sıcak tema, sizin logonuz) |
| http://localhost:3000/k/anadoluvet | Demo hastane sitesi (Modern tema) |
| http://localhost:3000/k/mavikanat | Demo egzotik klinik (Egzotik tema, koyu) |
| http://patidostu.localhost:3000 | Aynı site, **kendi alan adıyla** açılmış gibi |
| http://localhost:3000/giris | Klinik paneli girişi |
| http://localhost:3000/admin | Platform yönetimi (klinik ekleme, alan adı) |

| Hesap | E-posta | Şifre |
| --- | --- | --- |
| Klinik yöneticisi | `klinik@patidostu.com` | `pati123` |
| Diğer demo klinikler | `klinik@anadoluvet.com`, `klinik@mavikanat.com` | `pati123` |
| Platform yöneticisi | `admin@patipanel.local` | `admin123` |

> `*.localhost` adresleri Chrome, Edge ve Firefox'ta ek ayar gerekmeden çalışır.

## Neler var?

**Klinik web sitesi**
- 3 tema (Sıcak, Modern, Egzotik), klinik başına logo, 5 renk, pati tipi (kedi, köpek, karışık, kuş)
- Sayfa geçişleri: tıklanan noktadan açılan perde, ekranı çapraz geçen pati izleri, ortada kalp gibi atan logo
- Kelime kelime yaylanarak gelen başlık, fareyle paralaks yapan yüzen patiler, logonun etrafında dönen pati yörüngesi
- Fare imleci pati izi bırakır, sağ kenarda kaydırdıkça yürüyen pati yolu, 3B eğilen hizmet kartları
- Sayfanın altında beliren, gözleriyle imleci takip eden kedi/köpek/kuş; tıklayınca kalp ve pati konfetisi
- Randevu tamamlanınca 70 parçalık pati konfetisi, alt bilgide yürüyen patiler, kayan hizmet şeridi
- Animasyon yoğunluğu panelden seçilir (Sakin, Normal, Coşkulu). Cihazında "hareketi azalt" açık olanlara animasyon gösterilmez.
- Mobilde altta sabit "Ara / Randevu Al / WhatsApp" çubuğu, acil hat şeridi, Google haritası
- Google için yapısal veri (`VeterinaryCare`), sayfa başlıkları ve açıklamaları

**Online randevu**
- 4 adım: hizmet, hekim (ya da "fark etmez"), gün ve saat, bilgiler. Pati ilerleme çubuğu.
- Boş saatler çalışma saatleri, hizmet süresi ve hekimlerin dolu saatlerine göre hesaplanır
- Aynı saati iki kişi aynı anda seçerse ikincisine "bu saat az önce doldu" denir
- KVKK açık rıza onayı, telefona göre hasta sahibi ve hayvan kaydı otomatik oluşur
- Takvime ekle (.ics) ve WhatsApp butonları

**Klinik paneli**
- Özet: bugünün randevuları, onay bekleyenler, yaklaşan aşılar, son 14 gün grafiği
- **"Bu ay hatırlatmadan gelen randevu"** sayacı: ürünün klinikteki değerini gösteren rakam
- Randevular: gün/hafta gezinme, durum filtreleri, onayla, tamamlandı, gelmedi, iptal, telefonla gelen randevuyu ekleme
- Hastalar: arama, sahip ve hayvan kaydı, aşı ekleme (aralığa göre sonraki tarih otomatik), QR karne, sahibine WhatsApp ile gönderme
- Hatırlatmalar: aşıdan 14 gün önce ve randevudan 1 gün önce otomatik mesaj, dönüşüm oranı
- Mesajlar: gönderilen tüm mesajlar, her biri tek tıkla WhatsApp'ta açılır
- Web Sitesi: tema, renkler, pati tipi, animasyon, logo yükleme, metinler, iletişim, çalışma saatleri
- Hizmetler, Ekip (fotoğraflı), Galeri ve Yorumlar

**Platform yönetimi**
- Yeni klinik: ad, adres, tema, şifre. Kaydedince site ve panel anında yayında, başlangıç hizmetleri hazır.
- Alan adı bağlama, paket, yayında/kapalı, "Paneline gir" ile kliniğe destek
- Toplam klinik, hasta, randevu ve aylık gelir özeti

## Çok klinikli yapı nasıl çalışıyor?

```
Ziyaretçi patidostu.com'a girer
        │
        ▼
middleware.ts  →  "Bu adres hangi klinik?"  →  /k/patidostu sayfasını gösterir
        │
        ▼
Veritabanından o kliniğin teması, renkleri, logosu, metinleri çekilir
```

- Her tablo `clinicId` taşır; bir klinik diğerinin verisini göremez.
- Kod güncellemesi bir kez yapılır, tüm kliniklerde aynı anda yayına girer.
- Bir kliniğe tamamen özel tasarım gerekirse `components/site` altında ona özel bileşen yazılıp temaya bağlanır; diğer klinikler etkilenmez.

## Proje yapısı

```
app/
  page.tsx                 Platform tanıtım sayfası
  k/[slug]/                Klinik sitesi (ana sayfa, hizmetler, ekip, galeri, iletişim, randevu, karne)
  panel/                   Klinik paneli
  admin/                   Platform yönetimi
  giris/                   Giriş
  api/public/              Randevu, boş saatler, hatırlatma linki, takvim dosyası
  api/cron/reminders       Canlıda her sabah çalışan hatırlatma görevi
components/
  fx/                      Tüm animasyonlar (sayfa geçişi, patiler, konfeti, imleç izi...)
  site/                    Klinik sitesi bileşenleri (hero, menü, randevu sihirbazı...)
  panel/                   Panel bileşenleri
lib/                       Veritabanı, oturum, saat dilimi, boş saat hesabı, hatırlatma motoru, mesajlaşma
prisma/schema.prisma       Veri modeli
prisma/seed.mjs            Demo veriler
middleware.ts              Alan adına göre klinik yönlendirmesi
```

**Teknoloji:** Next.js 15 (React 19), TypeScript, Prisma ORM, SQLite (yerel) / PostgreSQL (canlı), Framer Motion, Lucide ikonlar.

## WhatsApp ile gerçek mesaj gönderimi

Varsayılan `MESSAGE_PROVIDER="SIMULE"`: mesajlar gönderilmez, panelde **Mesajlar** ekranında listelenir ve her biri tek tıkla WhatsApp'ta açılıp elle gönderilebilir.

Otomatik gönderim için Meta WhatsApp Business Cloud API hesabı açıp `.env` dosyasına yazın:

```
MESSAGE_PROVIDER="WHATSAPP_CLOUD"
WHATSAPP_TOKEN="..."
WHATSAPP_PHONE_NUMBER_ID="..."
```

> Not: WhatsApp, işletmenin başlattığı ilk mesajlar için Meta'da onaylı **şablon mesaj** ister. Canlıya geçerken `lib/messaging.ts` içindeki gönderim şablon mesaja çevrilmeli. SMS için Netgsm, İleti Merkezi gibi bir sağlayıcı aynı dosyaya eklenebilir.

## Canlıya alma (Vercel + Supabase)

1. Kodu GitHub'a gönderin (bu repo).
2. https://supabase.com üzerinde ücretsiz proje açın, **Database → Connection string** adresini kopyalayın.
3. `prisma/schema.prisma` içinde `provider = "sqlite"` satırını `provider = "postgresql"` yapın.
4. https://vercel.com üzerinde **Add New → Project** ile repoyu seçin. Environment Variables:
   - `DATABASE_URL` = Supabase bağlantı adresi
   - `PUBLIC_URL` = `https://patipanel.com` (platformun adresi)
   - `PLATFORM_HOSTS` = `patipanel.com,www.patipanel.com`
   - `ROOT_DOMAIN` = `patipanel.com` (klinikler `klinikadi.patipanel.com` olarak da açılır)
   - `CRON_SECRET` = uzun rastgele bir metin
5. Bilgisayarınızda bir kez `DATABASE_URL=... npx prisma db push` ve `npm run seed` çalıştırın.
6. Her klinik için: admin panelinde alan adını yazın, Vercel'de **Settings → Domains** bölümüne ekleyin, kliniğin alan adı panelinde Vercel'in verdiği kaydı girin. https otomatik gelir.

`vercel.json` hatırlatma görevini her gün 09:00'da (Türkiye saati) çalıştırır.

> Canlıda yüklenen görseller için Vercel'in diski kalıcı değildir; `lib/upload.ts` Supabase Storage'a yönlendirilmelidir (sıradaki iş).

## Nihai kararlar (beyin fırtınasından)

| Konu | Karar |
| --- | --- |
| Platform | Önce web (mobil uyumlu). Native mobil uygulama, klinikler kullanmaya başladıktan sonra React Native ile. |
| Odak | Kliniğin dışa dönük yüzü ve hasta iletişimi: site + randevu + hatırlatma + yorum. Stok, fatura, muayene kaydı rakiplerin alanı, bilerek yok. |
| Satış argümanı | "Ayda birkaç geri gelen aşı hastası aboneliği öder." Panelde ölçülüyor. |
| Dil | Her yerde TypeScript (site, panel, sunucu, ileride mobil). |
| Çok klinik | Tek kod, tek veritabanı, alan adına göre klinik seçimi. |
| Barındırma | Başlangıçta Vercel + Supabase (~45-50 $/ay sabit), büyüyünce VPS + Coolify seçeneği. |
| Paketler | Vitrin, Klinik, Pro (fiyatlar örnek, klinik görüşmelerinden sonra netleşecek). |

## Sıradaki işler

- WhatsApp şablon mesajları ve SMS sağlayıcısı
- Görsel yükleme için Supabase Storage
- Kliniğin kendi personel hesaplarını panelden yönetmesi
- Online ön ödeme / kapora (iyzico)
- Yapay zekâ ile sosyal medya içeriği önerisi
- React Native ile hekim mobil uygulaması (bildirimler)
