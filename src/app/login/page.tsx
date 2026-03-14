"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ここでパスワードをチェック（例: "2024mj" など好きなものに変更してください）
    if (password === "9071") {
      // ブラウザに「認証済み」の印を1ヶ月間保存
      document.cookie = "auth=true; path=/; max-age=2592000";
      router.push("/");
    } else {
      alert("パスワードが違います");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-4xl mb-4">🀄</div>
        <h1 className="text-xl font-black text-gray-800 mb-6 font-sans">麻雀成績アプリ</h1>
        <input 
          type="password" 
          placeholder="パスワードを入力"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-gray-100 rounded-2xl p-4 mb-4 focus:border-blue-500 outline-none text-center font-bold"
        />
        <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all">
          ログイン
        </button>
      </form>
    </div>
  );
}
