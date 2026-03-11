import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  // ログイン画面自体や、API、静的ファイル（画像など）は除外
  if (pathname.startsWith('/login') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // クッキーがない場合はログイン画面にリダイレクト
  if (!auth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 適用する範囲（基本すべて）
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
