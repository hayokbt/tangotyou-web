"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleAccount = async () => {
    if (!isLoggedIn) {
      router.push("/account");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/account/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setIsLoggedIn(false);
      } else {
        console.error("logout failed", await res.text());
      }
    } catch (error) {
      console.error("logout error:", error);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/account/me", { credentials: "include" });
        if (!res.ok) {
          setIsLoggedIn(false);
          setUsername("");
          return;
        }
        const data = await res.json();
        setIsLoggedIn(Boolean(data?.loggedIn));
        setUsername(data?.username || "");
      } catch (error) {
        console.error("login check error:", error);
        setIsLoggedIn(false);
        setUsername("");
      }
    };

    checkLogin();
  }, []);

  const handleBookList = async () => {
      router.push("/booklist");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
        
        {/* アプリタイトル */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            単語帳アプリ
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            サクサク覚えて、記憶に定着。
          </p>
        </div>

        <hr className="border-gray-100" />

        {/* 状態に応じたコンテンツの切り替え */}
        {!isLoggedIn ? (
          /* 1. 未ログイン時の表示 */
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              サービスを利用するにはアカウントが必要です。
            </p>
            <button
              type="button"
              onClick={handleAccount}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              ログイン / 新規登録
            </button>
          </div>
        ) : (
          /* 2. ログイン済みの表示 */
          <div className="space-y-6">
            {/* ユーザー情報バッジ */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 inline-block w-full">
              <p className="text-sm font-medium text-green-800">
                👤 <span className="font-bold">{username}</span> としてログイン中
              </p>
            </div>

            {/* メインアクション：ブックリストへ */}
            <div>
              <button
                type="button"
                onClick={handleBookList}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                ブックリストを開く 📖
              </button>
            </div>

            {/* サブアクション：ログアウト */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
              >
                ログアウトする
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}