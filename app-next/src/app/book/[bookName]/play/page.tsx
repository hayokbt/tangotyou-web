"use client"

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWords, Word } from "@/data/word";

export default function Play() {
  const params = useParams();
  const router = useRouter();
  const bookName = params.bookName as string;

  const [words, setWords] = useState<Word[]>([]);
  const [selected, setSelected] = useState<Word | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookName) return;

    let isCancelled = false;

    const loadWords = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getWords(bookName);
        if (isCancelled) return;

        setWords(result);
        setSelected(result.length > 0 ? result[Math.floor(Math.random() * result.length)] : null);
        setShowMeaning(false);
      } catch {
        if (isCancelled) return;

        setError("単語の取得に失敗しました。もう一度お試しください。");
        setWords([]);
        setSelected(null);
        setShowMeaning(false);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadWords();
    return () => {
      isCancelled = true;
    };
  }, [bookName]);

  const showNextWord = () => {
    if (words.length === 0) {
      setSelected(null);
      setShowMeaning(false);
      return;
    }
    const nextIndex = Math.floor(Math.random() * words.length);
    setSelected(words[nextIndex]);
    setShowMeaning(false);
  };

  const revealMeaning = () => {
    setShowMeaning(true);
  };

  const handleBack = () => {
    router.push(`/book/${encodeURIComponent(bookName)}`);
  };

  const decodedBookName = useMemo(
    () => (bookName ? decodeURIComponent(bookName) : ""),
    [bookName]
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🎮 {decodedBookName} の Playモード</h1>
            <p className="text-sm text-gray-600 mt-1">このブックの単語からランダムに1件を表示します。</p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-md"
          >
            ← 単語一覧に戻る
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">ランダム出題</h2>
            <button
              type="button"
              onClick={showNextWord}
              disabled={loading || words.length === 0}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors"
            >
              次の単語
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">読み込み中...</div>
          ) : words.length === 0 ? (
            <div className="py-20 text-center text-gray-500">このブックにはまだ単語が登録されていません。</div>
          ) : selected ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">単語</p>
                <p className="mt-3 text-3xl font-bold text-gray-900 break-words">{selected.term}</p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">意味</p>
                  <button
                    type="button"
                    onClick={revealMeaning}
                    disabled={showMeaning}
                    className="rounded-md px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600 transition-colors"
                  >
                    {showMeaning ? "表示中" : "意味を見る"}
                  </button>
                </div>
                <div className="mt-3 min-h-[4rem]">
                  {showMeaning ? (
                    <p className="text-lg text-gray-800 leading-relaxed break-words">{selected.meaning}</p>
                  ) : (
                    <p className="text-lg text-gray-400 leading-relaxed italic">意味を表示するにはボタンを押してください。</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500">ランダムな単語を選択しています...</div>
          )}
        </div>
      </div>
    </div>
  );
}
