"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MainMenu() {
  const [topPlayer, setTopPlayer] = useState({ name: "-", point: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTop() {
      try {
        const res = await fetch("/api/get-all-scores");
        const data = await res.json();
        
        if (data && data.length > 0) {
          // 1. 全データからユニークなシーズン一覧を作り、降順にソートして「最新」を特定
          const seasons = Array.from(new Set(data.map((item: any) => item.season)))
            .sort()
            .reverse();
          const latestSeason = seasons[0];

          // 2. 最新シーズンのデータだけをフィルタリング
          const seasonData = data.filter((d: any) => d.season === latestSeason);
          
          // 3. プレイヤーごとに集計
          const totals: { [key: string]: number } = {};
          seasonData.forEach((d: any) => {
            totals[d.userId] = (totals[d.userId] || 0) + d.point;
          });

          // 4. 集計結果から最大値の人を見つける
          const entries = Object.entries(totals);
          if (entries.length > 0) {
            const winner = entries.sort((a, b) => b[1] - a[1])[0];
            setTopPlayer({ name: winner[0], point: winner[1] });
          }
        }
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTop();
  }, []);

  const menuItems = [
    { title: "対局を記録", desc: "本日のスコアを入力", icon: "🀄", href: "/entry", color: "bg-blue-600" },
    { title: "ランキング", desc: "通算成績・順位表", icon: "🏆", href: "/ranking", color: "bg-yellow-500" },
    { title: "推移グラフ", desc: "ポイント変動を可視化", icon: "📈", href: "/history", color: "bg-green-500" },
    { title: "対局履歴", desc: "過去の全記録・削除", icon: "📝", href: "/logs", color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-6 font-sans">
      {/* ヘッダー・現在の首位 */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl rotate-12">🀄</div>
        <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Current Leader</h2>
        {loading ? (
          <div className="h-10 w-24 bg-gray-100 animate-pulse rounded"></div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-800">{topPlayer.name}</span>
            <span className="text-blue-600 font-mono font-bold">
              {topPlayer.point > 0 ? `+${topPlayer.point.toFixed(1)}` : topPlayer.point.toFixed(1)} pt
            </span>
          </div>
        )}
      </div>

      {/* メニューボタン一覧 */}
      <div className="w-full max-w-sm grid grid-cols-1 gap-4">
        {menuItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <div className="bg-white hover:bg-gray-50 active:scale-95 transition-all p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 group">
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-800 text-lg leading-none mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs font-medium">{item.desc}</p>
              </div>
              <div className="text-gray-300 group-hover:text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-auto pt-10">
        <p className="text-[10px] text-gray-300 font-bold tracking-[0.2em] uppercase italic">
          Family Mahjong System
        </p>
      </footer>
    </div>
  );
}
