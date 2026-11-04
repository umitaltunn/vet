/** Sik kullanilan asilar ve varsayilan tekrar araliklari (gun). Hekim formda degistirebilir. */
export const VACCINES = [
  { name: "Karma (FVRCP)", species: "Kedi", days: 365 },
  { name: "Lösemi (FeLV)", species: "Kedi", days: 365 },
  { name: "Karma (DHPPi+L)", species: "Köpek", days: 365 },
  { name: "Bronşin (KC)", species: "Köpek", days: 365 },
  { name: "Corona", species: "Köpek", days: 365 },
  { name: "Kuduz", species: "Hepsi", days: 365 },
  { name: "İç Parazit", species: "Hepsi", days: 90 },
  { name: "Dış Parazit", species: "Hepsi", days: 60 },
  { name: "Yavru Serisi (Karma tekrar)", species: "Hepsi", days: 28 },
] as const;
