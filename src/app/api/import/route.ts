import { NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import fs from 'fs';
import path from 'path';

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

// ★ここを実際の5名の名前に書き換えてください★
const PLAYER_NAMES = ["米本充", "米本弘美", "坂本由美子", "山田真夕", "山田勇次"];

export async function GET() {
    try {
        // CSVファイルの読み込み
        const csvPath = path.join(process.cwd(), 'data', 'import-data.csv');
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        
        // 行ごとに分割し、空行を除去
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
        
        let count = 0;

        // ヘッダー（1行目）を飛ばして2行目からループ
        for (let i = 1; i < lines.length; i++) {
            const [id, date, ...points] = lines[i].split(',');

            // プレイヤーの人数分（CSVの列数分）ループ
            for (let pIdx = 0; pIdx < points.length; pIdx++) {
                const pointValue = points[pIdx]?.trim();
                
                // ポイントが空、または数値でない場合はスキップ
                if (!pointValue || isNaN(parseFloat(pointValue))) continue;

                const playerName = PLAYER_NAMES[pIdx] || `ゲスト_${pIdx + 1}`;
                
                // DynamoDBへ1件ずつ保存（ここがタッパー形式！）
                await docClient.send(new PutCommand({
                    TableName: "MahjongScores",
                    Item: {
                        userId: playerName,            // パーティションキー（名前）
                        gameId: `game_${id.padStart(4, '0')}`, // ソートキー（例: game_0001）
                        point: parseFloat(pointValue), // 精算ポイント
                        matchDate: date,               // 対局日
                        playerIndex: pIdx + 1,         // 元々player何番だったか
                        importedAt: new Date().toISOString()
                    }
                }));
                count++;
            }
        }

        return NextResponse.json({ message: `成功！ ${count} 件のデータを移行しました。` });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
