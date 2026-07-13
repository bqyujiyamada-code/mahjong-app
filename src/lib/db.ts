import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { ScoreItem } from "@/lib/types";

const TABLE_NAME = "MahjongScores";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// 1回のScanは最大1MB/1ページ分しか返らないため、LastEvaluatedKeyが無くなるまでページングする
export async function scanAllScores(): Promise<ScoreItem[]> {
  const items: ScoreItem[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(
      new ScanCommand({ TableName: TABLE_NAME, ExclusiveStartKey }),
    );
    items.push(...((result.Items as ScoreItem[] | undefined) ?? []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
}

export async function scanScoresByGameId(gameId: string): Promise<ScoreItem[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "gameId = :gid",
      ExpressionAttributeValues: { ":gid": gameId },
    }),
  );
  return (result.Items as ScoreItem[] | undefined) ?? [];
}

export async function putScore(item: ScoreItem): Promise<void> {
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
}

export async function deleteScore(userId: string, gameId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { userId, gameId } }),
  );
}

export async function updateSeason(
  userId: string,
  gameId: string,
  season: string,
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, gameId },
      UpdateExpression: "set season = :s",
      ExpressionAttributeValues: { ":s": season },
    }),
  );
}
