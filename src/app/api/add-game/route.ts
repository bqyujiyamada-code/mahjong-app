import { NextResponse } from "next/server";
import { putScore, scanAllScores } from "@/lib/db";
import { getSeasonName } from "@/lib/season";

export async function POST(req: Request) {
  try {
    const { date, scores } = await req.json();

    // 最新のgameIdを取得して、次のIDを決める
    const allData = await scanAllScores();
    const maxId = allData.reduce((max, item) => {
      const id = parseInt((item.gameId || "game_0").replace("game_", ""));
      return id > max ? id : max;
    }, 0);
    const newGameId = `game_${String(maxId + 1).padStart(4, "0")}`;
    const season = getSeasonName(date);

    // 各プレイヤーごとに保存（1対局で5件のレコードを作る）
    for (const [name, point] of Object.entries(scores)) {
      if (point === "" || point === null) continue;

      await putScore({
        userId: name,
        gameId: newGameId,
        point: parseFloat(point as string),
        matchDate: date,
        season,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
