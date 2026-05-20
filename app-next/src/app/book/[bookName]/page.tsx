"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Word {
  id: number;
  term: string;
  meaning: string;
}

export default function BookDetail() {
  const params = useParams();
  const router = useRouter();
  const bookName = params.bookName as string;

  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editMeaning, setEditMeaning] = useState("");

  const fetchWords = useCallback(async () => {
    if (!bookName) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/word/${encodeURIComponent(bookName)}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "failed to fetch" }));
        setError(data?.error || "単語一覧の読み込みに失敗しました。");
        setWords([]);
      } else {
        const data = await res.json();
        setWords(Array.isArray(data?.words) ? data.words : []);
      }
    } catch (err) {
      setError("単語一覧の読み込みに失敗しました。");
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, [bookName]);

  const fetchWordsRef = useRef(fetchWords);

  useEffect(() => {
    fetchWordsRef.current = fetchWords;
  }, [fetchWords]);

  useEffect(() => {
    fetchWordsRef.current?.();
  }, []);

  const addWord = async () => {
    const term = newTerm.trim();
    const meaning = newMeaning.trim();
    if (!term || !meaning) {
      setError("単語と意味を入力してください。");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/word/${encodeURIComponent(bookName)}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ term, meaning }),
      });
      const data = await res.json().catch(() => ({ error: "backend error" }));
      if (!res.ok) {
        setError(data?.error || "単語の追加に失敗しました。");
        setLoading(false);
        return;
      }
      setNewTerm("");
      setNewMeaning("");
      await fetchWords();
    } catch (err) {
      setError("単語の追加に失敗しました。");
      setLoading(false);
    }
  };

  const startEdit = (word: Word) => {
    setEditingId(word.id);
    setEditTerm(word.term);
    setEditMeaning(word.meaning);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTerm("");
    setEditMeaning("");
  };

  const updateWord = async () => {
    if (!editingId) return;
    const term = editTerm.trim();
    const meaning = editMeaning.trim();
    if (!term || !meaning) {
      setError("単語と意味を入力してください。");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/word/${encodeURIComponent(bookName)}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wordId: editingId, term, meaning }),
      });
      const data = await res.json().catch(() => ({ error: "backend error" }));
      if (!res.ok) {
        setError(data?.error || "単語の更新に失敗しました。");
        setLoading(false);
        return;
      }
      setEditingId(null);
      setEditTerm("");
      setEditMeaning("");
      await fetchWords();
    } catch (err) {
      setError("単語の更新に失敗しました。");
      setLoading(false);
    }
  };

  const deleteWord = async (wordId: number) => {
    setError("");
    try {
      const res = await fetch(`/api/word/${encodeURIComponent(bookName)}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wordId }),
      });
      const data = await res.json().catch(() => ({ error: "backend error" }));
      if (!res.ok) {
        setError(data?.error || "単語の削除に失敗しました。");
        return;
      }
      await fetchWords();
    } catch (err) {
      setError("単語の削除に失敗しました。");
    }
  };

  const handleBack = () => {
    router.push("/booklist");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ナビゲーションヘッダー */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            📖 {decodeURIComponent(bookName)}
          </h1>
          <button 
            type="button" 
            onClick={handleBack} 
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50 border border-gray-200"
          >
            ← ブック一覧に戻る
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-md text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* 単語追加エリア (編集モードじゃない時だけ表示) */}
        {editingId === null && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-700">新しい単語を追加</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* 単語（1コラム分） */}
              <div className="md:col-span-1 space-y-1">
                <label className="text-xs text-gray-500 font-medium">単語 / 用語</label>
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="例: apple"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* 意味（2コラム分に広げて横長に） */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-gray-500 font-medium">意味 / 解説</label>
                <input
                  type="text"
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="例: りんご"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* 追加ボタン */}
              <button 
                type="button" 
                onClick={addWord}
                className="w-full md:col-span-1 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors h-[38px]"
              >
                追加する
              </button>
            </div>
          </div>
        )}

        {/* 単語一覧エリア */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center justify-between">
            <span>収録単語一覧</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-normal">
              {words.length} 語
            </span>
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              <span className="animate-pulse">データを読み込み中...</span>
            </div>
          )}

          {!loading && words.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-sm text-gray-400">この本にはまだ単語が登録されていません。</p>
            </div>
          )}

          {/* リスト表示部分 */}
          {!loading && words.length > 0 && (
            <div className="space-y-3">
              {words.map((word) =>
                editingId === word.id ? (
                  /* --- 編集モードの行 --- */
                  <div key={word.id} className="p-4 bg-gray-50 rounded-xl border-2 border-blue-500 space-y-3 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-blue-600 font-bold">単語</label>
                        <input
                          type="text"
                          value={editTerm}
                          onChange={(e) => setEditTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {/* 編集時の「意味」を2倍広く取る */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs text-blue-600 font-bold">意味</label>
                        <input
                          type="text"
                          value={editMeaning}
                          onChange={(e) => setEditMeaning(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    {/* 編集ボタンエリア */}
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={updateWord}
                        className="py-1.5 px-4 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                      >
                        保存する
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="py-1.5 px-4 rounded-md text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  /* --- 通常モードの行 --- */
                  <div 
                    key={word.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all gap-4"
                  >
                    {/* 単語と意味の表示エリア */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 flex-1 gap-2 sm:gap-4">
                      <div className="font-bold text-gray-900 text-base break-words">
                        {word.term}
                      </div>
                      {/* 意味の表示領域を広めに確保 */}
                      <div className="sm:col-span-2 text-sm text-gray-600 break-words border-l-0 sm:border-l sm:pl-4 border-gray-200">
                        {word.meaning}
                      </div>
                    </div>
                    {/* 操作ボタンエリア */}
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => startEdit(word)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWord(word.id)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold text-red-600 rounded-md hover:bg-red-50 hover:border-red-200 shadow-sm transition-all"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}