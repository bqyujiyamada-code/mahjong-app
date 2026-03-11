import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
    try {
        // 1. 全データを取得（スキャン）
        const data = await docClient.send(new ScanCommand({ TableName: "MahjongScores" }));
        if (!data.Items) return NextResponse.json({ message: "データが見つかりませんでした。" });

        let updatedCount = 0;

        for (const item of data.Items) {
            const dateStr = item.matchDate.S; 
            if (!dateStr) continue;

            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 1-12月

            let seasonName = "";
            
            if (month >= 4 && month <= 9) {
                // 4月〜9月：その年の前期
                seasonName = `${year}年度 前期マッチ`;
            } else {
                // 10月〜3月：後期
                // 1月〜3月の場合は、年度としては「前年」扱い
                const fiscalYear = month <= 3 ? year - 1 : year;
                seasonName = `${fiscalYear}年度 後期マッチ`;
            }

            // 2. DynamoDBの各アイテムにseason属性を追加・更新
            await docClient.send(new UpdateCommand({
                TableName: "MahjongScores",
                Key: {
                    userId: item.userId.S,
                    gameId: item.gameId.S
                },
                UpdateExpression: "set season = :s",
                ExpressionAttributeValues: {
                    ":s": seasonName
                }
            }));
            updatedCount++;
        }

        return NextResponse.json({ 
            message: `完了！ ${updatedCount}件のデータに「前期/後期マッチ」ラベルを付与しました。` 
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
