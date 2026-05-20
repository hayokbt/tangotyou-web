"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BookList() {
  const [books, setBooks] = useState<Array<{ id: number; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [deleteTitle, setDeleteTitle] = useState("");
  const router = useRouter();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setAddError("");
    try {
      const res = await fetch("/api/book", { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "failed to fetch" }));
        setAddError(data?.error || "単語帳リストの読み込みに失敗しました。");
        setBooks([]);
      } else {
        const data = await res.json();
        setBooks(Array.isArray(data?.books) ? data.books : []);
      }
    } catch (err) {
      setAddError("単語帳リストの読み込みに失敗しました。");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBooksRef = useRef(fetchBooks);

  useEffect(() => {
    fetchBooksRef.current = fetchBooks;
  }, [fetchBooks]);

  useEffect(() => {
    fetchBooksRef.current?.();
  }, []);

  const addBook = async () => {
    const title = newTitle.trim();
    if (!title) {
      setAddError("単語帳のタイトルを入力してください。");
      return;
    }

    setLoading(true);
    setAddError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      const data = await res.json().catch(() => ({ error: "backend error" }));
      if (!res.ok) {
        setAddError(data?.error || "単語帳の追加に失敗しました。");
        return;
      }
      setNewTitle("");
      await fetchBooks();
    } catch (err) {
      setAddError("単語帳の追加に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async () => {
    const title = deleteTitle.trim();
    if (!title) {
      setDeleteError("削除する単語帳のタイトルを入力してください。");
      return;
    }

    setDeleteError("");
    try {
      const res = await fetch("/api/book", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      const data = await res.json().catch(() => ({ error: "backend error" }));
      if (!res.ok) {
        setDeleteError(data?.error || "単語帳の削除に失敗しました。");
        return;
      }
      setDeleteTitle("");
      await fetchBooks();
    } catch (err) {
      setDeleteError("単語帳の削除に失敗しました。");
    }
  };

  const handleHome = async () => {
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ヘッダーナビゲーション */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            📖 マイ単語帳一覧
          </h1>
          <button 
            type="button" 
            onClick={handleHome} 
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50 border border-gray-200"
          >
            ← ホームへ戻る
          </button>
        </div>

        {/* メイングリッド（フォームとリストを並べる） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 左側：操作パネル（追加・削除） */}
          <div className="md:col-span-1 space-y-4">
            
            {/* 追加フォーム */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-sm font-bold text-gray-700">新しい単語帳を作る</h3>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="例: TOEIC頻出単語"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button 
                type="button" 
                onClick={addBook}
                disabled={loading}
                className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                追加する
              </button>
              {addError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{addError}</p>}
            </div>

            {/* 削除フォーム */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-sm font-bold text-gray-700">名前を指定して削除</h3>
              <input
                type="text"
                value={deleteTitle}
                onChange={(e) => setDeleteTitle(e.target.value)}
                placeholder="削除する正確なタイトル"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm"
              />
              <button 
                type="button" 
                onClick={deleteBook}
                className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                削除する
              </button>
              {deleteError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{deleteError}</p>}
            </div>

          </div>

          {/* 右側：単語帳リスト表示 */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
              <span>登録済みの単語帳</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-normal">
                {books.length} 個のアイテム
              </span>
            </h2>

            {/* ローディング状態 */}
            {loading && (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                <span className="animate-pulse">データを読み込み中...</span>
              </div>
            )}

            {/* データが空のとき */}
            {!loading && !addError && books.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-sm text-gray-400">まだ単語帳がありません。</p>
                <p className="text-xs text-gray-400 mt-1">左のフォームから作成してみましょう！</p>
              </div>
            )}

            {/* リスト表示 */}
            {!loading && books.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {books.map((book) => (
                  <div 
                    key={book.id} 
                    className="flex justify-between items-center p-3.5 bg-gray-50 rounded-lg border border-gray-200/60 hover:border-blue-300 hover:bg-blue-50/10 transition-all group"
                  >
                    <span className="font-medium text-gray-800 truncate pr-2" title={book.title}>
                      {book.title}
                    </span>
                    <Link href={`/book/${encodeURIComponent(book.title)}`} className="shrink-0">
                      <button 
                        type="button" 
                        className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-md hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm transition-all flex items-center gap-1"
                      >
                        開く ➔
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}