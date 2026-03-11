"use client";
import { useEffect, useState } from "react";

interface ScoreItem {
  userId: string;
  point: number;
  matchDate: string;
  gameId: string;
  season: string;
}

export default function LogsPage() {
  const [allData, setAllData] = useState<ScoreItem[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/get-all-scores");
    const data = await res.json();
    setAllData(data);
    if (data.length > 0 && !selectedSeason) {
      const seasons = Array.from(new Set(data.map((item: any) => item.season))).sort().reverse();
      setSelectedSeason(seasons[0] as string);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (gameId: string, date: string) => {
    if (!confirm(`${date} の対局データを削除してもよろしいですか？\nこの操作は取り消せません。`)) return;

    try {
      const res = await fetch("/api/delete-game", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId })
      });
      if (res.ok) {
        alert("削除しました");
        fetchData(); // データを再読み込み
      } else {
        alert("削除に失敗しました");
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    }
  };

  const seasonData = allData.filter(item => item.season === selectedSeason);
  const gamesMap = seasonData.reduce((acc: any, cur) => {
    if (!acc[cur.gameId]) {
      acc[cur.gameId] = { gameId: cur.gameId, date: cur.matchDate, scores: {} };
    }
    acc[cur.gameId].scores[cur.userId] = cur.point;
    return acc;
  }, {});

  const sortedGames = Object.values(gamesMap).sort((a: any, b: any) => b.gameId.localeCompare(a.gameId));
  const playerNames = ["米本充", "米本弘美", "坂本由美子", "山田真夕", "山田勇次"]; 

  if (loading) return <div className="flex justify-center items-center h-screen font-bold text-blue-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">📝 対局履歴</h1>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-2 py-2 text-xs font-bold shadow-sm"
          >
            {Array.from(new Set(allData.map(i => i.season))).sort().reverse().map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-[10px] uppercase">
                  <th className="py-4 px-2 text-left w-[15%]">日付</th>
                  {playerNames.map(name => (
                    <th key={name} className="py-4 px-1 text-center truncate">{name}</th>
                  ))}
                  <th className="py-4 px-2 text-center w-[12%]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedGames.map((game: any) => (
                  <tr key={game.gameId} className="hover:bg-red-50 transition-colors text-[11px]">
                    <td className="py-4 px-2 font-medium text-gray-500">{game.date.split('-').slice(1).join('/')}</td>
                    {playerNames.map(name => {
                      const score = game.scores[name];
                      return (
                        <td key={name} className={`py-4 px-1 text-center font-mono font-bold ${
                          score > 0 ? 'text-blue-600' : score < 0 ? 'text-red-500' : 'text-gray-300'
                        }`}>
                          {score !== undefined ? (score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1)) : '-'}
                        </td>
                      );
                    })}
                    {/* 削除ボタン */}
                    <td className="py-4 px-2 text-center">
                      <button 
                        onClick={() => handleDelete(game.gameId, game.date)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors active:scale-90"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
