// 4〜9月をその年の前期、10〜3月を後期とする年度区分。1〜3月は前年の年度扱い
export function getSeasonName(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4 && month <= 9) {
    return `${year}年度 前期マッチ`;
  }
  const fiscalYear = month <= 3 ? year - 1 : year;
  return `${fiscalYear}年度 後期マッチ`;
}

export function getSortedSeasons(items: { season: string }[]): string[] {
  return Array.from(new Set(items.map((item) => item.season)))
    .sort()
    .reverse();
}

export function getLatestSeason(items: { season: string }[]): string | undefined {
  return getSortedSeasons(items)[0];
}
