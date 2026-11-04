// Demo verileri: 3 klinik, hekimler, hizmetler, hastalar, asilar, randevular.
// Calistirmak icin: npm run seed   (sifirlamak icin: npm run reset)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "fs";

// .env dosyasini oku (node dogrudan calistirildiginda otomatik yuklenmez)
for (const f of [".env", ".env.example"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const db = new PrismaClient();
const OFF = 3 * 3600 * 1000;
const dayKey = (d) => new Date(d.getTime() + OFF).toISOString().slice(0, 10);
const addDays = (day, n) => { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const at = (day, t = "10:00") => new Date(`${day}T${t}:00+03:00`);
const today = dayKey(new Date());
const wd = (day) => new Date(`${day}T12:00:00Z`).getUTCDay();
// Pazar'a denk gelirse bir gun kaydir (klinik kapali)
const open = (day) => (wd(day) === 0 ? addDays(day, 1) : day);

const HOURS = {
  0: [],
  1: [["09:00", "12:30"], ["13:30", "19:00"]],
  2: [["09:00", "12:30"], ["13:30", "19:00"]],
  3: [["09:00", "12:30"], ["13:30", "19:00"]],
  4: [["09:00", "12:30"], ["13:30", "19:00"]],
  5: [["09:00", "12:30"], ["13:30", "19:00"]],
  6: [["10:00", "16:00"]],
};

async function main() {
  const existing = await db.clinic.count();
  if (existing > 0) {
    console.log("Veritabaninda zaten veri var, demo veriler atlandi. Sifirlamak icin: npm run reset");
    return;
  }

  const pw = (s) => bcrypt.hashSync(s, 10);

  await db.user.create({ data: { email: "admin@patipanel.local", name: "Platform Yöneticisi", role: "SUPERADMIN", passwordHash: pw("admin123") } });

  // ---------------- 1) Pati Dostu (kullanicinin markasi) ----------------
  const pd = await db.clinic.create({
    data: {
      slug: "patidostu",
      name: "Pati Dostu Veteriner Kliniği",
      plan: "PRO",
      theme: "sicak",
      pawType: "karisik",
      animationLevel: "coskulu",
      logoUrl: "/demo/patidostu-logo.png",
      primaryColor: "#247C86",
      accentColor: "#F06F62",
      bgColor: "#F6F3EC",
      darkColor: "#292B3D",
      goldColor: "#C7A77A",
      tagline: "Kedi ve köpek dostlarınız için kalpten bakım",
      heroTitle: "Patili dostunuz için sevgi dolu bakım",
      heroSubtitle: "Aşıdan cerrahiye, kuaförden acil müdahaleye kadar her şey tek çatı altında. Online randevunuzu 30 saniyede alın, aşı zamanını biz hatırlatalım.",
      about: "2014'ten beri Kadıköy'de kedi ve köpek dostlarımıza hizmet veriyoruz. Korkusuz muayene (fear-free) yaklaşımıyla, hayvanınızın stresini en aza indiren sakin bir ortamda çalışıyoruz. Kedilere ayrı bekleme alanı, köpeklere ayrı giriş: herkes rahat etsin diye.",
      phone: "0216 555 12 34",
      whatsapp: "0532 555 12 34",
      email: "merhaba@patidostu.com",
      address: "Caferağa Mah. Moda Cad. No: 42, Kadıköy",
      city: "İstanbul",
      mapQuery: "Moda Caddesi Kadıköy İstanbul",
      emergencyPhone: "0532 555 12 34",
      instagram: "patidostuvet",
      googleReviewUrl: "https://g.page/r/patidostu-demo/review",
      workingHours: JSON.stringify(HOURS),
      slotMinutes: 30,
    },
  });
  await db.user.create({ data: { email: "klinik@patidostu.com", name: "Dr. Elif Aydın", role: "CLINIC_ADMIN", clinicId: pd.id, passwordHash: pw("pati123") } });
  await db.user.create({ data: { email: "sekreter@patidostu.com", name: "Zeynep (Sekreter)", role: "STAFF", clinicId: pd.id, passwordHash: pw("pati123") } });

  const pdServices = await Promise.all([
    ["Genel Muayene", "Baştan kuyruğa kontrol, kilo ve beslenme danışmanlığı.", "stethoscope", 30, "750 TL"],
    ["Aşı Uygulaması", "Karma, kuduz, lösemi ve tüm koruyucu aşılar. Aşı karnesi dijital.", "syringe", 20, "Aşıya göre"],
    ["Kısırlaştırma", "Kedi ve köpeklerde modern anestezi ile güvenli operasyon.", "scissors", 90, "Ön görüşmeyle"],
    ["Diş Bakımı", "Ultrasonik diş taşı temizliği ve ağız sağlığı kontrolü.", "smile", 60, "1.500 TL'den"],
    ["Görüntüleme", "Dijital röntgen ve ultrason ile hızlı teşhis.", "scan", 30, "900 TL'den"],
    ["Pet Kuaför", "Yıkama, tıraş, tırnak ve kulak bakımı. Stressiz ortam.", "sparkles", 60, "800 TL'den"],
  ].map(([name, description, icon, durationMin, priceText], order) =>
    db.service.create({ data: { clinicId: pd.id, name, description, icon, durationMin, priceText, order } })));

  const pdVets = await Promise.all([
    ["Dr. Elif Aydın", "Kurucu Veteriner Hekim", "Kedi davranışı ve iç hastalıkları. 12 yıllık deneyim, 3 kedi annesi."],
    ["Dr. Mert Kaya", "Veteriner Hekim, Cerrahi", "Yumuşak doku cerrahisi ve ortopedi. Golden'ı Fıstık'la koşu tutkunu."],
    ["Dr. Selin Öztürk", "Veteriner Hekim", "Aşı programları, yavru bakımı ve beslenme. Korkusuz muayene sertifikalı."],
  ].map(([name, title, bio], order) => db.vet.create({ data: { clinicId: pd.id, name, title, bio, order } })));

  await db.testimonial.createMany({ data: [
    { clinicId: pd.id, author: "Ayşe K.", petName: "Pamuk", text: "Pamuk veterinerden nefret ederdi, burada ilk kez miyavlamadan muayene oldu. Aşı zamanını WhatsApp'tan hatırlatmaları da çok iyi.", rating: 5 },
    { clinicId: pd.id, author: "Burak T.", petName: "Zeytin", text: "Gece yarısı acil aradık, 10 dakikada kapıyı açtılar. Zeytin'in hayatını kurtardılar.", rating: 5 },
    { clinicId: pd.id, author: "Deniz Y.", petName: "Lokum ve Tarçın", text: "Online randevu çok pratik, beklemeden içeri girdik. İki kedimizin aşı karnesi de telefonumda.", rating: 5 },
  ] });

  // Hastalar
  const people = [
    ["Ayşe Kılıç", "0532 111 22 33", [["Pamuk", "Kedi", "Van Kedisi", "Dişi", -900]]],
    ["Burak Tan", "0533 222 33 44", [["Zeytin", "Köpek", "Labrador", "Erkek", -1500]]],
    ["Deniz Yıldız", "0534 333 44 55", [["Lokum", "Kedi", "British Shorthair", "Dişi", -400], ["Tarçın", "Kedi", "Tekir", "Erkek", -700]]],
    ["Can Demir", "0535 444 55 66", [["Fıstık", "Köpek", "Golden Retriever", "Erkek", -200]]],
    ["Merve Şahin", "0536 555 66 77", [["Boncuk", "Kedi", "Scottish Fold", "Dişi", -1100]]],
    ["Emre Arslan", "0537 666 77 88", [["Karamel", "Köpek", "Pomeranian", "Dişi", -1800]]],
    ["Selin Koç", "0538 777 88 99", [["Duman", "Kedi", "Ankara Kedisi", "Erkek", -2500]]],
    ["Hakan Polat", "0539 888 99 00", [["Paşa", "Köpek", "Kangal", "Erkek", -1300]]],
  ];
  const pets = [];
  for (const [name, phone, petList] of people) {
    const owner = await db.owner.create({ data: { clinicId: pd.id, name, phone: phone.replace(/\D/g, "").replace(/^0/, "90"), kvkkConsent: true, consentAt: new Date() } });
    for (const [pname, species, breed, sex, ageDays] of petList) {
      pets.push(await db.pet.create({ data: { clinicId: pd.id, ownerId: owner.id, name: pname, species, breed, sex, birthDate: at(addDays(today, ageDays)), neutered: ageDays < -365 } }));
    }
  }
  const P = Object.fromEntries(pets.map((p) => [p.name, p]));
  // Asilar: bir kismi yaklasiyor, bir kismi gecikmis -> hatirlatma motoru bunlari yakalar
  const vacc = [
    ["Pamuk", "Karma (FVRCP)", -355, 365], // 10 gun sonra
    ["Pamuk", "Kuduz", -200, 365],
    ["Zeytin", "Kuduz", -362, 365], // 3 gun sonra
    ["Zeytin", "Karma (DHPPi+L)", -100, 365],
    ["Lokum", "Lösemi (FeLV)", -370, 365], // 5 gun gecikmis
    ["Tarçın", "İç Parazit", -85, 90], // 5 gun sonra
    ["Fıstık", "Karma (DHPPi+L)", -21, 28], // 7 gun sonra (yavru serisi)
    ["Fıstık", "Kuduz", -10, 365],
    ["Boncuk", "Dış Parazit", -58, 60], // 2 gun sonra
    ["Karamel", "Bronşin (KC)", -150, 365],
    ["Duman", "Karma (FVRCP)", -30, 365],
    ["Paşa", "Kuduz", -340, 365], // 25 gun sonra (henuz pencerede degil)
  ];
  for (const [pname, name, givenOff, interval] of vacc) {
    const given = addDays(today, givenOff);
    await db.vaccination.create({ data: { clinicId: pd.id, petId: P[pname].id, name, givenAt: at(given), nextDueAt: at(addDays(given, interval)), vetName: "Dr. Selin Öztürk" } });
  }

  // Randevular
  const svc = Object.fromEntries(pdServices.map((s) => [s.name, s]));
  const mk = async (day, time, sName, vet, petName, status, source = "ONLINE", note = "") => {
    const pet = P[petName];
    const owner = await db.owner.findUnique({ where: { id: pet.ownerId } });
    const s = svc[sName];
    const startAt = at(day, time);
    await db.appointment.create({ data: {
      clinicId: pd.id, serviceId: s.id, vetId: vet.id, ownerId: owner.id, petId: pet.id,
      startAt, endAt: new Date(startAt.getTime() + s.durationMin * 60000), status, source,
      ownerName: owner.name, ownerPhone: owner.phone, petName: pet.name, petSpecies: pet.species, note,
    } });
  };
  const t0 = open(today), t1 = open(addDays(today, 1)), t2 = open(addDays(today, 2));
  await mk(t0, "10:00", "Genel Muayene", pdVets[0], "Duman", "ONAYLANDI", "PANEL");
  await mk(t0, "11:00", "Aşı Uygulaması", pdVets[2], "Fıstık", "ONAYLANDI", "HATIRLATMA");
  await mk(t0, "14:00", "Diş Bakımı", pdVets[1], "Karamel", "BEKLIYOR", "ONLINE", "Ağız kokusu var, yemek yerken zorlanıyor.");
  await mk(t0, "16:30", "Pet Kuaför", pdVets[2], "Boncuk", "BEKLIYOR", "ONLINE");
  await mk(t1, "09:30", "Kısırlaştırma", pdVets[1], "Paşa", "ONAYLANDI", "PANEL", "Aç gelecek.");
  await mk(t1, "15:00", "Aşı Uygulaması", pdVets[2], "Lokum", "BEKLIYOR", "HATIRLATMA");
  await mk(t2, "11:30", "Görüntüleme", pdVets[0], "Zeytin", "ONAYLANDI", "ONLINE", "Arka bacağında topallama.");
  for (let i = 1; i <= 12; i++) {
    const d = addDays(today, -i * 2);
    if (wd(d) === 0) continue;
    const pn = ["Pamuk", "Zeytin", "Lokum", "Tarçın", "Fıstık", "Boncuk"][i % 6];
    const sn = ["Genel Muayene", "Aşı Uygulaması", "Pet Kuaför"][i % 3];
    await mk(d, ["10:00", "11:30", "14:00", "16:00"][i % 4], sn, pdVets[i % 3], pn, i === 5 ? "GELMEDI" : "TAMAMLANDI", i % 3 === 1 ? "HATIRLATMA" : i % 2 ? "ONLINE" : "PANEL");
  }

  // ---------------- 2) Anadolu Vet (modern tema) ----------------
  const av = await db.clinic.create({
    data: {
      slug: "anadoluvet", name: "Anadolu Veteriner Hastanesi", plan: "PRO", theme: "modern", pawType: "kopek", animationLevel: "normal", cursorTrail: false,
      primaryColor: "#1E3A8A", accentColor: "#0EA5E9", bgColor: "#F8FAFC", darkColor: "#0F172A", goldColor: "#94A3B8",
      tagline: "7/24 açık tam donanımlı veteriner hastanesi",
      heroTitle: "Gelişmiş teşhis, uzman kadro, 7/24 acil",
      heroSubtitle: "Yoğun bakım ünitesi, dijital röntgen, ultrason ve tam donanımlı ameliyathane ile Ankara'nın kalbinde.",
      about: "18 uzman hekim, 3 ameliyathane ve 24 saat yoğun bakım ile bölgenin referans hastanesiyiz. Diğer kliniklerden gelen sevkleri kabul ediyoruz.",
      phone: "0312 444 00 11", whatsapp: "0530 444 00 11", email: "info@anadoluvet.com", address: "Kızılay Mah. Atatürk Blv. No: 120, Çankaya", city: "Ankara",
      mapQuery: "Atatürk Bulvarı Çankaya Ankara", emergencyPhone: "0530 444 00 11", googleReviewUrl: "https://g.page/r/anadoluvet-demo/review",
      workingHours: JSON.stringify({ 0: [["10:00", "18:00"]], 1: [["08:00", "20:00"]], 2: [["08:00", "20:00"]], 3: [["08:00", "20:00"]], 4: [["08:00", "20:00"]], 5: [["08:00", "20:00"]], 6: [["09:00", "18:00"]] }),
      slotMinutes: 20,
    },
  });
  await db.user.create({ data: { email: "klinik@anadoluvet.com", name: "Dr. Kemal Yurt", role: "CLINIC_ADMIN", clinicId: av.id, passwordHash: pw("pati123") } });
  for (const [order, [name, description, icon, durationMin]] of [
    ["Acil ve Yoğun Bakım", "7/24 acil müdahale ve monitörlü yoğun bakım.", "siren", 30],
    ["Ortopedi", "Kırık, bağ kopması ve kalça displazisi cerrahisi.", "bone", 40],
    ["Kardiyoloji", "EKO, EKG ve kalp hastalıkları takibi.", "heart-pulse", 40],
    ["Dahiliye", "Böbrek, karaciğer ve hormon hastalıkları.", "stethoscope", 30],
    ["Laboratuvar", "Kan sayımı, biyokimya, hızlı testler 20 dakikada.", "flask", 20],
    ["Onkoloji", "Tümör teşhisi ve kemoterapi protokolleri.", "microscope", 40],
  ].entries()) await db.service.create({ data: { clinicId: av.id, name, description, icon, durationMin, order } });
  for (const [order, [name, title]] of [["Dr. Kemal Yurt", "Başhekim, Ortopedi"], ["Dr. Aslı Eren", "Kardiyoloji"], ["Dr. Onur Çelik", "Acil ve Yoğun Bakım"], ["Dr. Gizem Aksoy", "Dahiliye"]].entries())
    await db.vet.create({ data: { clinicId: av.id, name, title, order } });
  await db.testimonial.createMany({ data: [
    { clinicId: av.id, author: "Serkan A.", petName: "Rocky", text: "Rocky'nin çapraz bağ ameliyatı mükemmel geçti, 2 ayda koşmaya başladı.", rating: 5 },
    { clinicId: av.id, author: "Nil B.", petName: "Mia", text: "Gece 3'te açık ve uzman bir hekimle karşılaşmak paha biçilemez.", rating: 5 },
  ] });

  // ---------------- 3) Mavi Kanat (egzotik tema) ----------------
  const mk2 = await db.clinic.create({
    data: {
      slug: "mavikanat", name: "Mavi Kanat Egzotik Hayvan Kliniği", plan: "KLINIK", theme: "egzotik", pawType: "kus", animationLevel: "coskulu",
      primaryColor: "#10B981", accentColor: "#FBBF24", bgColor: "#0B1F1A", darkColor: "#ECFDF5", goldColor: "#34D399",
      tagline: "Kuşlar, sürüngenler ve küçük memeliler için uzman bakım",
      heroTitle: "Kanatlı, pullu ve kulaklı dostlarınızın uzmanı",
      heroSubtitle: "Papağan, kaplumbağa, iguana, tavşan, gine domuzu... Egzotik hayvanlar özel bilgi ister. Biz bu işi seviyoruz.",
      about: "Türkiye'de egzotik hayvan hekimliğine odaklanan az sayıdaki kliniklerden biriyiz. Türe özel anestezi, beslenme ve barınak danışmanlığı veriyoruz.",
      phone: "0232 333 44 55", whatsapp: "0531 333 44 55", email: "selam@mavikanat.com", address: "Alsancak Mah. Kıbrıs Şehitleri Cad. No: 7, Konak", city: "İzmir",
      mapQuery: "Kıbrıs Şehitleri Caddesi Alsancak İzmir", workingHours: JSON.stringify(HOURS), slotMinutes: 30,
    },
  });
  await db.user.create({ data: { email: "klinik@mavikanat.com", name: "Dr. Deniz Mavi", role: "CLINIC_ADMIN", clinicId: mk2.id, passwordHash: pw("pati123") } });
  for (const [order, [name, description, icon, durationMin]] of [
    ["Kuş Muayenesi", "Papağan, muhabbet, kanarya ve tüm kafes kuşları.", "bird", 30],
    ["Sürüngen Bakımı", "Kaplumbağa, iguana, gekko ve yılanlar. Terrarium danışmanlığı.", "turtle", 40],
    ["Küçük Memeliler", "Tavşan, gine domuzu, hamster, gelincik.", "rabbit", 30],
    ["Gaga ve Tırnak Bakımı", "Uzman ellerle güvenli kesim ve şekillendirme.", "scissors", 20],
  ].entries()) await db.service.create({ data: { clinicId: mk2.id, name, description, icon, durationMin, order } });
  for (const [order, [name, title]] of [["Dr. Deniz Mavi", "Egzotik Hayvan Hekimi"], ["Dr. Ece Yalın", "Kuş Hastalıkları"]].entries())
    await db.vet.create({ data: { clinicId: mk2.id, name, title, order } });
  await db.testimonial.createMany({ data: [
    { clinicId: mk2.id, author: "Okan D.", petName: "Kiwi (Jako)", text: "Kiwi'yi anlayan tek hekim. Tüy yolma sorunu 2 ayda geçti.", rating: 5 },
    { clinicId: mk2.id, author: "Yasemin L.", petName: "Tosbi", text: "Kaplumbağamızın kabuk sorununa çözüm bulabilen ilk klinik.", rating: 5 },
  ] });

  console.log("Demo veriler yuklendi.");
  console.log("  Super admin : admin@patipanel.local / admin123");
  console.log("  Klinik      : klinik@patidostu.com / pati123");
}

main().finally(() => db.$disconnect());
