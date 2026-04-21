export const whatsappNumber = "5500000000000";
export const instagramUrl = "https://instagram.com/diarioduotrz";
export const linktreeUrl = "https://linktr.ee/trz.diario";
export const tiktokUrl = "https://www.tiktok.com/@diarioduotrz";

export const scheduleSlots = [
  { time: "10:00", status: "Disponivel", filled: 28, slots: 48 },
  { time: "14:00", status: "Disponivel", filled: 35, slots: 48 },
  { time: "18:00", status: "Lotado", filled: 48, slots: 48 },
  { time: "21:00", status: "Disponivel", filled: 17, slots: 48 },
];

export const rankingByDate = {
  "2026-04-13": [
    { player: "TRZ Shadow", kills: 8, placement: "1 lugar", earned: 8 },
    { player: "Rush Alpha", kills: 6, placement: "2 lugar", earned: 6 },
    { player: "Snipe King", kills: 5, placement: "3 lugar", earned: 5 },
    { player: "Bermuda Fox", kills: 4, placement: "5 lugar", earned: 4 },
    { player: "Wolf Duo", kills: 3, placement: "7 lugar", earned: 3 },
  ],
  "2026-04-12": [
    { player: "Ghost TRZ", kills: 10, placement: "1 lugar", earned: 10 },
    { player: "Tropa Norte", kills: 7, placement: "2 lugar", earned: 7 },
    { player: "Nexus FF", kills: 6, placement: "4 lugar", earned: 6 },
    { player: "Arena Duo", kills: 5, placement: "6 lugar", earned: 5 },
    { player: "Capa Reta", kills: 4, placement: "8 lugar", earned: 4 },
  ],
  "2026-04-11": [
    { player: "TRZ Prime", kills: 9, placement: "1 lugar", earned: 9 },
    { player: "Delta Duo", kills: 7, placement: "3 lugar", earned: 7 },
    { player: "Insano FF", kills: 6, placement: "4 lugar", earned: 6 },
    { player: "Lendarios", kills: 4, placement: "6 lugar", earned: 4 },
    { player: "Impact Team", kills: 3, placement: "9 lugar", earned: 3 },
  ],
} as const;

export type RankingDate = keyof typeof rankingByDate;

export const rankingDates = Object.keys(rankingByDate) as RankingDate[];
