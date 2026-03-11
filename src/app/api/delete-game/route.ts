import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

export async function DELETE(req: Request) {
    try {
        const { gameId } = await req.json();

        // 1. そのgameIdに関連する全レコード（4人〜5人分）を特定するためにスキャン
        // (本来はインデックスを貼るのが理想ですが、家庭用ツールなのでScanで対応)
        const allData = await docClient.send(new ScanCommand({
            TableName: "MahjongScores",
            FilterExpression: "gameId = :gid",
            ExpressionAttributeValues: { ":gid": { S: gameId } }
        }));

        if (!allData.Items || allData.Items.length === 0) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        // 2. 特定したレコードをすべて削除
        for (const item of allData.Items) {
            await docClient.send(new DeleteCommand({
                TableName: "MahjongScores",
                Key: {
                    userId: item.userId.S,
                    gameId: item.gameId.S
                }
            }));
        }

        return NextResponse.json({ message: "Successfully deleted" });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
