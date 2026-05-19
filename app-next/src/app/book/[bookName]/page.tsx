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
    <div style={{ padding: "20px" }}>
      <h1>{decodeURIComponent(bookName)}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 20, marginBottom: 30 }}>
        <h2>単語を追加</h2>
        {editingId === null && (
          <>
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="単語"
              style={{ padding: 8, marginRight: 8, marginBottom: 8 }}
            />
            <input
              type="text"
              value={newMeaning}
              onChange={(e) => setNewMeaning(e.target.value)}
              placeholder="意味"
              style={{ padding: 8, marginRight: 8, marginBottom: 8 }}
            />
            <button type="button" onClick={addWord}>
              追加
            </button>
          </>
        )}
      </div>

      {loading && <p>読み込み中...</p>}

      {!loading && words.length === 0 && (
        <p style={{ color: "blue" }}>（この本に単語がありません）</p>
      )}

      {!loading && words.length > 0 && (
        <div>
          <h2>単語一覧</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #333" }}>
                <th style={{ textAlign: "left", padding: "10px" }}>単語</th>
                <th style={{ textAlign: "left", padding: "10px" }}>意味</th>
                <th style={{ textAlign: "left", padding: "10px" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) =>
                editingId === word.id ? (
                  <tr key={word.id} style={{ backgroundColor: "#504f4f", borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px" }}>
                      <input
                        type="text"
                        value={editTerm}
                        onChange={(e) => setEditTerm(e.target.value)}
                        style={{ width: "100%", padding: "4px" }}
                      />
                    </td>
                    <td style={{ padding: "10px" }}>
                      <input
                        type="text"
                        value={editMeaning}
                        onChange={(e) => setEditMeaning(e.target.value)}
                        style={{ width: "100%", padding: "4px" }}
                      />
                    </td>
                    <td style={{ padding: "10px" }}>
                      <button
                        type="button"
                        onClick={updateWord}
                        style={{ marginRight: "8px", backgroundColor: "#4CAF50", color: "white", padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={{ backgroundColor: "#666", color: "white", padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        キャンセル
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={word.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px" }}>{word.term}</td>
                    <td style={{ padding: "10px" }}>{word.meaning}</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        type="button"
                        onClick={() => startEdit(word)}
                        style={{ marginRight: "8px", backgroundColor: "#2196F3", color: "white", padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWord(word.id)}
                        style={{ backgroundColor: "#ff6b6b", color: "white", padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={handleBack}
        style={{ marginTop: 20, padding: "8px 16px", backgroundColor: "#666", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        ブック一覧に戻る
      </button>
    </div>
  );
}
