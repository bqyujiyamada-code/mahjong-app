import { NextResponse } from "next/server";
import { deleteScore, scanScoresByGameId } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const { gameId } = await req.json();

    // そのgameIdに関連する全レコード（4人〜5人分）を特定する
    // (本来はインデックスを貼るのが理想ですが、家庭用ツールなのでScanで対応)
    const items = await scanScoresByGameId(gameId);

    if (items.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    for (const item of items) {
      await deleteScore(item.userId, item.gameId);
    }

    return NextResponse.json({ message: "Successfully deleted" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
