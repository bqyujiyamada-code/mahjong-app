"use client";
import { useEffect, useState } from "react";
import Link from "next/link"; // 追加

interface ScoreItem {
  userId: string;
  point: number;
  season: string;
}

interface UserRanking {
  name: string;
  totalPoint: number;
  gameCount: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<UserRanking[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/get-all-scores");
      const data: ScoreItem[] = await res.json();

      if (data.length > 0) {
        const uniqueSeasons = Array.from(new Set(data.map(item => item.season))).sort().reverse();
        setSeasons(uniqueSeasons);
        
        // もしURLパラメータにseasonがあればそれを優先、なければ最新
        const params = new URLSearchParams(window.location.search);
        const seasonParam = params.get('season');
        const targetSeason = seasonParam && uniqueSeasons.includes(seasonParam) ? seasonParam : uniqueSeasons[0];
        
        setSelectedSeason(targetSeason);
        calculateRanking(data, targetSeason);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const calculateRanking = (data: ScoreItem[], season: string) => {
    const seasonData = data.filter(item => item.season === season);
    const userMap: { [key: string]: UserRanking } = {};

    seasonData.forEach(item => {
      if (!userMap[item.userId]) {
        userMap[item.userId] = { name: item.userId, totalPoint: 0, gameCount: 0 };
      }
      userMap[item.userId].totalPoint += item.point;
      userMap[item.userId].gameCount += 1;
    });

    const sorted = Object.values(userMap).sort((a, b) => b.totalPoint - a.totalPoint);
    setRanking(sorted);
  };

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    setLoading(true);
    fetch("/api/get-all-scores")
      .then(res => res.json())
      .then(data => {
        calculateRanking(data, season);
        setLoading(false);
      });
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* --- ナビゲーション追加 --- */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1">
            🏠 ホーム
          </Link>
          <Link 
            href={`/logs?season=${selectedSeason}`} 
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
          >
            📋 このシーズンの対局一覧 →
          </Link>
        </div>
        {/* ----------------------- */}

        {/* ヘッダーエリア */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            🏆 通算ランキング
          </h1>
          <select
            value={selectedSeason}
            onChange={(e) => handleSeasonChange(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
          >
            {seasons.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* ランキングテーブル */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white text-[10px] uppercase tracking-tighter">
                <th className="py-4 px-1 text-center w-[15%]">順位</th>
                <th className="py-4 px-2 text-left w-[38%] font-bold">プレイヤー</th>
                <th className="py-4 px-1 text-center w-[22%] font-bold">対局数</th>
                <th className="py-4 px-3 text-right w-[25%] font-bold">Pt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ranking.map((user, index) => (
                <tr key={user.name} className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 px-1 text-center">
                    <span className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs
                      ${index === 0 ? 'bg-yellow-400 text-white shadow-sm' :
                        index === 1 ? 'bg-gray-300 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' : 'text-gray-400 bg-gray-50'}
                    `}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-2 font-black text-gray-700 text-[13px] sm:text-sm truncate">
                    {user.name}
                  </td>
                  <td className="py-4 px-1 text-center">
                    <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                      {user.gameCount}<span className="font-normal ml-0.5 text-[9px]">戦</span>
                    </span>
                  </td>
                  <td className={`py-4 px-3 text-right font-mono font-black text-[14px] sm:text-base whitespace-nowrap
                    ${user.totalPoint >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {user.totalPoint > 0 ? `+${user.totalPoint.toFixed(1)}` : user.totalPoint.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-[10px] text-gray-400 tracking-widest uppercase italic">
          Data updated in real-time
        </p>
      </div>
    </div>
  );
}
