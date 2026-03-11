import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// AWS接続設定を環境変数から読み込むように修正
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
    try {
        const data = await docClient.send(new ScanCommand({ TableName: "MahjongScores" }));
        
        const items = data.Items?.map(item => ({
            userId: item.userId?.S || "Unknown",
            gameId: item.gameId?.S || "", 
            point: item.point?.N ? Number(item.point.N) : 0,
            season: item.season?.S || "未設定",
            matchDate: item.matchDate?.S || ""
        })) || [];
        
        return NextResponse.json(items);
    } catch (error) {
        console.error("DynamoDB Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
