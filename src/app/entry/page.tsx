'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EntryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // ホームに戻るボタンのスタイル（共通で使えます）
    const navButtonStyle = {
        display: 'inline-block',
        padding: '8px 16px',
        backgroundColor: '#4a5568',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '14px',
        marginBottom: '20px'
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            {/* ナビゲーションエリア */}
            <nav>
                <Link href="/" style={navButtonStyle}>
                    ← ホームに戻る
                </Link>
            </nav>

            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                対局結果の入力
            </h1>

            {/* ここから下に既存の入力フォームが続く */}
            <form>
                {/* 既存のフォームコードをここに維持 */}
                <p style={{ color: '#666' }}>※ここに既存の入力項目（名前、スコアなど）が表示されます</p>
            </form>
        </div>
    );
}
