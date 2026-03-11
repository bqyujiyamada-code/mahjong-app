"use client";
import { useEffect, useState } from "react";
import Link from "next/link"; // 追加
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScoreItem {
  userId: string;
  point: number;
  matchDate: string;
  gameId: string;
  season: string;
}

export default function HistoryPage() {
  const [allData, setAllData] = useState<ScoreItem[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/get-all-scores");
      const data = await res.json();
      setAllData(data);
      if (data.length > 0) {
        const seasons = Array.from(new Set(data.map((item: any) => item.season))).sort().reverse();
        setSelectedSeason(seasons[0] as string);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const chartData = () => {
    const seasonData = allData.filter(item => item.season === selectedSeason);
    const sortedGames = Array.from(new Set(seasonData.map(item => item.gameId))).sort();
    
    let userTotals: { [key: string]: number } = {};
    
    return sortedGames.map(gameId => {
      const gameResults = seasonData.filter(d => d.gameId === gameId);
      const rawDate = gameResults[0]?.matchDate || "";
      const dateLabel = rawDate ? `${new Date(rawDate).getMonth() + 1}/${new Date(rawDate).getDate()}` : "";
      
      const entry: any = { name: dateLabel };
      
      gameResults.forEach(r => {
        if (!userTotals[r.userId]) userTotals[r.userId] = 0;
        userTotals[r.userId] += r.point;
        entry[r.userId] = parseFloat(userTotals[r.userId].toFixed(1));
      });
      return entry;
    });
  };

  const currentChartData = chartData();
  const users = Array.from(new Set(allData.map(item => item.userId)));
  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  const dynamicWidth = Math.max(currentChartData.length * 60, 600);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* --- ナビゲーション追加 --- */}
        <div className="mb-6">
          <Link href="/" className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1">
            🏠 ホームに戻る
          </Link>
        </div>
        {/* ----------------------- */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            📈 ポイント推移
          </h1>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
          >
            {Array.from(new Set(allData.map(i => i.season))).sort().reverse().map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="overflow-x-auto pb-4">
            <div style={{ width: `${dynamicWidth}px`, height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} tickMargin={10} interval={0} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  {users.map((user, index) => (
                    <Line 
                      key={user} 
                      type="monotone" 
                      dataKey={user} 
                      stroke={colors[index % colors.length]} 
                      strokeWidth={3} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <p className="mt-4 text-center text-gray-500 text-sm italic">
          ← スマホの方は横にスワイプして推移を確認できます →
        </p>
      </div>
    </div>
  );
}
