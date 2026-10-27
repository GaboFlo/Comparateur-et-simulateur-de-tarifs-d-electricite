import { getTempoSeasons } from "./tempoSeasons";

describe("getTempoSeasons", () => {
  it("s'arrête à la saison 2025-2026 jusqu'au 31 août 2026", () => {
    const seasons = getTempoSeasons(new Date("2026-08-31T12:00:00Z"));
    expect(seasons).toEqual([
      "2022-2023",
      "2023-2024",
      "2024-2025",
      "2025-2026",
    ]);
  });

  it("ajoute la saison 2026-2027 dès le 1er septembre 2026", () => {
    const seasons = getTempoSeasons(new Date("2026-09-01T00:00:00Z"));
    expect(seasons.at(-1)).toBe("2026-2027");
  });

  it("ajoute la saison 2027-2028 dès le 1er septembre 2027", () => {
    const seasons = getTempoSeasons(new Date("2027-09-01T00:00:00Z"));
    expect(seasons.at(-1)).toBe("2027-2028");
    expect(seasons).toHaveLength(6);
  });
});
