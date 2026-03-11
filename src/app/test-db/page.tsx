import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// 東京リージョンのDynamoDBに接続する設定
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

export default async function TestDBPage() {
  let message = "";

  try {
    // 保存するデータの中身
    const command = new PutCommand({
      TableName: "MahjongScores",
      Item: {
        userId: "test-user-001", // パーティションキー
        gameId: `game-${Date.now()}`, // ソートキー（重複しないように現在の時間を入れる）
        score: 25000,
        rank: 3,
        date: new Date().toISOString(),
      },
    });

    await docClient.send(command);
    message = "✅ DynamoDBへの書き込みに成功しました！";
  } catch (error) {
    console.error(error);
    message = "❌ エラーが発生しました: " + (error as Error).message;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>DB接続テスト</h1>
      <p>{message}</p>
      <a href="/">ホームに戻る</a>
    </div>
  );
}
