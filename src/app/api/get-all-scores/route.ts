import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
    try {
        const data = await docClient.send(new ScanCommand({ TableName: "MahjongScores" }));
        const items = data.Items?.map(item => ({
            userId: item.userId.S,
            gameId: item.gameId.S, // これがグラフのX軸になります
            point: Number(item.point.N),
            season: item.season?.S || "未設定",
            matchDate: item.matchDate?.S || ""
        })) || [];
        
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
