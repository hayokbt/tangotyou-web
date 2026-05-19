export interface Word {
  id: number;
  term: string;
  meaning: string;
}

export interface WordResponse {
  success: boolean;
  words?: Word[];
  id?: number;
  error?: string;
}

export async function getWords(bookName: string): Promise<Word[]> {
  const res = await fetch(`/api/word/${encodeURIComponent(bookName)}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch words");
  }

  const data: WordResponse = await res.json();
  return data.words || [];
}

export async function createWord(
  bookName: string,
  term: string,
  meaning: string
): Promise<number> {
  const res = await fetch(`/api/word/${encodeURIComponent(bookName)}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ term, meaning }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "backend error" }));
    throw new Error(data?.error || "Failed to create word");
  }

  const data: WordResponse = await res.json();
  return data.id || 0;
}

export async function updateWord(
  bookName: string,
  wordId: number,
  term: string,
  meaning: string
): Promise<void> {
  const res = await fetch(`/api/word/${encodeURIComponent(bookName)}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wordId, term, meaning }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "backend error" }));
    throw new Error(data?.error || "Failed to update word");
  }
}

export async function deleteWord(bookName: string, wordId: number): Promise<void> {
  const res = await fetch(`/api/word/${encodeURIComponent(bookName)}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wordId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "backend error" }));
    throw new Error(data?.error || "Failed to delete word");
  }
}
