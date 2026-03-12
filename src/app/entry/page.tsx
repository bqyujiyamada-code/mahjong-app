"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 追加

export default function EntryPage() {
  const router = useRouter();
  // 実際の5名
  const playerNames = ["米本充", "米本弘美", "坂本由美子", "山田真夕", "山田勇次"]; 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [participants, setParticipants] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(playerNames.map(name => [name, true]))
  );
  const [scores, setScores] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleSign = (name: string) => {
    const currentVal = scores[name] || "";
    if (currentVal === "" || currentVal === "0") return;
    if (currentVal.startsWith("-")) {
      setScores({ ...scores, [name]: currentVal.substring(1) });
    } else {
      setScores({ ...scores, [name]: "-" + currentVal });
    }
  };

  const totalScore = Object.entries(scores).reduce((acc, [name, val]) => {
    return participants[name] ? acc + (parseFloat(val) || 0) : acc;
  }, 0);
  
  const isZero = Math.abs(totalScore) < 0.01;

  const getSeasonName = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (month >= 4 && month <= 9) return `${year}年度 前期マッチ`;
    const fiscalYear = month <= 3 ? year - 1 : year;
    return `${fiscalYear}年度 後期マッチ`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isZero) {
      alert("合計点が0になりません！");
      return;
    }
    const finalScores: { [key: string]: string } = {};
    Object.keys(scores).forEach(name => {
      if (participants[name] && scores[name] !== "") {
        finalScores[name] = scores[name];
      }
    });
    if (Object.keys(finalScores).length === 0) {
      alert("参加者がいません");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/add-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          scores: finalScores,
          season: getSeasonName(date)
        }),
      });
      if (res.ok) {
        setMessage("✅ 保存完了！");
        setTimeout(() => router.push("/ranking"), 1500);
      }
    } catch (err) {
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 font-sans text-gray-900">
      <div className="max-w-md mx-auto">
        
        {/* --- ナビゲーション追加 --- */}
        <div className="mb-4">
          <Link href="/" className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1">
            🏠 ホームに戻る
          </Link>
        </div>
        {/* ----------------------- */}

        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-gray-100">
          <h1 className="text-lg font-black text-center mb-5 flex items-center justify-center gap-2">
            <span className="text-xl">🀄</span> 対局記録入力
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="bg-green-100 text-green-700 p-3 rounded-2xl text-center font-bold text-sm">
                {message}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Match Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full box-border appearance-none border-gray-200 border rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-medium text-base"
              required
            />
              <p className="text-[11px] text-blue-500 mt-2 ml-1 font-bold">🏆 {getSeasonName(date)}</p>
            </div>

            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Players & Scores</label>
              {playerNames.map(name => (
                <div key={name} className={`flex items-center gap-1.5 p-1.5 pl-2 rounded-2xl border transition-all ${
                  participants[name] ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-100 border-transparent opacity-60'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={participants[name]}
                    onChange={(e) => setParticipants({...participants, [name]: e.target.checked})}
                    className="w-4 h-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  
                  <span className={`w-[72px] font-bold text-[12px] leading-tight flex-shrink-0 whitespace-nowrap overflow-hidden ${participants[name] ? 'text-gray-800' : 'text-gray-400'}`}>
                    {name}
                  </span>

                  {participants[name] && (
                    <button
                      type="button"
                      onClick={() => toggleSign(name)}
                      className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 text-gray-600 font-bold text-[11px] active:bg-gray-200 transition-colors"
                    >
                      +/-
                    </button>
                  )}

                  <input 
                    type="number" 
                    step="0.1"
                    inputMode="decimal"
                    placeholder={participants[name] ? "0.0" : "-"}
                    disabled={!participants[name]}
                    value={participants[name] ? (scores[name] || "") : ""}
                    onChange={(e) => setScores({...scores, [name]: e.target.value})}
                    className="w-full min-w-0 bg-transparent text-right text-base sm:text-lg font-mono font-black focus:outline-none pr-1 text-blue-600 disabled:text-gray-300"
                  />
                </div>
              ))}
            </div>

            {/* 合計チェック */}
            <div className={`p-3 rounded-2xl text-center font-black transition-all ${isZero ? 'bg-green-50 text-green-600 ring-1 ring-green-100' : 'bg-red-50 text-red-500 ring-1 ring-red-100'}`}>
              <div className="text-[9px] uppercase tracking-widest mb-0.5 opacity-70">Total Balance</div>
              <div className="text-xl">{totalScore > 0 ? `+${totalScore.toFixed(1)}` : totalScore.toFixed(1)}</div>
              {!isZero && <p className="text-[9px] font-bold mt-0.5 animate-pulse">合計を0に調整してください</p>}
            </div>

            <button 
              disabled={!isZero || loading}
              className={`w-full py-3.5 rounded-2xl font-black text-white shadow-lg transform transition-all active:scale-95 text-sm ${
                isZero && !loading ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-gray-300 cursor-not-allowed shadow-none'
              }`}
            >
              {loading ? "SAVING..." : "RECORD SCORE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
