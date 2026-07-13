import { NextResponse } from "next/server";
import { scanAllScores, updateSeason } from "@/lib/db";
import { getSeasonName } from "@/lib/season";

export async function GET() {
  try {
    const items = await scanAllScores();
    if (items.length === 0) {
      return NextResponse.json({ message: "データが見つかりませんでした。" });
    }

    let updatedCount = 0;

    for (const item of items) {
      if (!item.matchDate) continue;

      const season = getSeasonName(item.matchDate);
      await updateSeason(item.userId, item.gameId, season);
      updatedCount++;
    }

    return NextResponse.json({
      message: `完了！ ${updatedCount}件のデータに「前期/後期マッチ」ラベルを付与しました。`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
