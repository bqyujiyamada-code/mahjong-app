import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(req: Request) {
    try {
        const { date, scores, season } = await req.json();

        // 最新のgameIdを取得して、次のIDを決める
        const allData = await docClient.send(new ScanCommand({ TableName: "MahjongScores" }));
        const maxId = allData.Items?.reduce((max, item) => {
            const id = parseInt((item.gameId?.S || "game_0").replace("game_", ""));
            return id > max ? id : max;
        }, 0) || 0;
        const newGameId = `game_${String(maxId + 1).padStart(4, '0')}`;

        // 各プレイヤーごとに保存（1対局で5件のレコードを作る）
        for (const [name, point] of Object.entries(scores)) {
            if (point === "" || point === null) continue;

            await docClient.send(new PutCommand({
                TableName: "MahjongScores",
                Item: {
                    userId: name,
                    gameId: newGameId,
                    point: parseFloat(point as string),
                    matchDate: date,
                    season: season,
                    createdAt: new Date().toISOString()
                }
            }));
        }

        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
