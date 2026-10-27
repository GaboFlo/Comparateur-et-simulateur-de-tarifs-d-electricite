const FIRST_SEASON_START_YEAR = 2022;
const SEASON_START_MONTH_INDEX = 8; // septembre : la saison Tempo court du 1er sept. au 31 août

export function getTempoSeasons(now: Date = new Date()): string[] {
  const currentSeasonStartYear =
    now.getUTCMonth() >= SEASON_START_MONTH_INDEX
      ? now.getUTCFullYear()
      : now.getUTCFullYear() - 1;

  const seasons: string[] = [];
  for (
    let year = FIRST_SEASON_START_YEAR;
    year <= currentSeasonStartYear;
    year++
  ) {
    seasons.push(`${year}-${year + 1}`);
  }
  return seasons;
}
