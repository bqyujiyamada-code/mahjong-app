import { NextResponse } from "next/server";
import { scanAllScores } from "@/lib/db";

export async function GET() {
  try {
    const items = await scanAllScores();

    // 旧データ（season未付与など）に備えたデフォルト値
    const normalized = items.map((item) => ({
      userId: item.userId ?? "Unknown",
      gameId: item.gameId ?? "",
      point: typeof item.point === "number" ? item.point : Number(item.point) || 0,
      season: item.season ?? "未設定",
      matchDate: item.matchDate ?? "",
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
