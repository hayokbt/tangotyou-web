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
        setAddError(data?.error || "Failed to load book list.");
        setBooks([]);
      } else {
        const data = await res.json();
        setBooks(Array.isArray(data?.books) ? data.books : []);
      }
    } catch (err) {
      setAddError("Failed to load book list.");
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
      setAddError("Bookタイトルを入力してください。");
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
        setAddError(data?.error || "bookの追加に失敗しました。");
        return;
      }
      setNewTitle("");
      await fetchBooks();
    } catch (err) {
      setAddError("bookの追加に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async () => {
    const title = deleteTitle.trim();
    if (!title) {
      setDeleteError("削除するbookのタイトルを入力してください。");
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
        setDeleteError(data?.error || "bookの削除に失敗しました。");
        return;
      }
      setDeleteTitle("");
      await fetchBooks();
    } catch (err) {
      setDeleteError("bookの削除に失敗しました。");
    }
  };

  const handleAccount = async () => {
    router.push("/");
  }

  return (
    <div>
      <h1>BookList</h1>
      {loading && <p>読み込み中...</p>}
      {!loading && addError && <p style={{ color: "red" }}>{addError}</p>}
      <div style={{ marginTop: 12 }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="追加するBookのタイトル"
          style={{ padding: 8, marginRight: 8 }}
        />
        <button type="button" onClick={addBook}>
          Bookを追加する
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <input
          type="text"
          value={deleteTitle}
          onChange={(e) => setDeleteTitle(e.target.value)}
          placeholder="削除するBookのタイトル"
          style={{ padding: 8, marginRight: 8 }}
        />
        <button type="button" onClick={deleteBook} style={{ backgroundColor: "#ff6b6b", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Bookを削除する
        </button>
      </div>
      {deleteError && <p style={{ color: "red" }}>{deleteError}</p>}
      {!loading && !addError && books.length === 0 && (
        <p style={{ color: "blue" }}>(bookを一つも持っていません)</p>
      )}
      {!loading && !addError && books.length > 0 && (
        <ul style={{ marginTop: 16 }}>
          {books.map((book) => (
            <li key={book.id} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{book.title}</span>
              <Link href={`/book/${encodeURIComponent(book.title)}`}>
                <button type="button" style={{ marginLeft: 8, padding: "4px 8px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  表示
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!loading && !addError && (
        <button type="button" onClick={handleAccount} style={{ marginLeft: 12 }}>
            ホームページへ
        </button>
      )}
    </div>
  );
}