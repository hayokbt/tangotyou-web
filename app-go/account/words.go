package account

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
)

func HandleWords(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if handleCorsPreflight(w, r) {
			return
		}

		// セッション取得
		session, err := store.Get(r, SessionName)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "session error"})
			return
		}

		userID, ok := session.Values["user_id"].(int)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "not logged in"})
			return
		}

		// URLパスからbookNameを抽出
		// /account/books/{bookName}/words から {bookName} を取得
		pathSegments := strings.Split(strings.TrimPrefix(r.URL.Path, "/"), "/")
		if len(pathSegments) < 4 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "invalid path"})
			return
		}
		bookName := pathSegments[2] // segments: ["account", "books", "{bookName}", "words"]

		// bookNameからbookIDを取得（ユーザーが所有していることを確認）
		var bookID int
		err = db.QueryRow("SELECT id FROM book WHERE title = ? AND user_id = ?", bookName, userID).Scan(&bookID)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "book not found"})
			return
		}

		w.Header().Set("Content-Type", "application/json")

		switch r.Method {
		case http.MethodGet:
			handleGetWords(w, db, bookID)
		case http.MethodPost:
			handleCreateWord(w, r, db, bookID)
		case http.MethodPut:
			handleUpdateWord(w, r, db, bookID)
		case http.MethodDelete:
			handleDeleteWord(w, r, db, bookID)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}
}

func handleGetWords(w http.ResponseWriter, db *sql.DB, bookID int) {
	rows, err := db.Query("SELECT id, term, meaning FROM word WHERE book_id = ?", bookID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch words"})
		return
	}
	defer rows.Close()

	words := []map[string]interface{}{}
	for rows.Next() {
		var id int
		var term, meaning string
		if err := rows.Scan(&id, &term, &meaning); err != nil {
			continue
		}
		words = append(words, map[string]interface{}{
			"id":      id,
			"term":    term,
			"meaning": meaning,
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"words":   words,
	})
}

func handleCreateWord(w http.ResponseWriter, r *http.Request, db *sql.DB, bookID int) {
	var body struct {
		Term    string `json:"term"`
		Meaning string `json:"meaning"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if body.Term == "" || body.Meaning == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "term and meaning are required"})
		return
	}

	result, err := db.Exec(
		"INSERT INTO word (term, meaning, book_id) VALUES (?, ?, ?)",
		body.Term, body.Meaning, bookID,
	)
	if err != nil {
		msg := err.Error()
		if strings.Contains(msg, "UNIQUE constraint failed") {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "word already exists in this book"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to create word"})
		return
	}

	wordID, _ := result.LastInsertId()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"id":      wordID,
	})
}

func handleUpdateWord(w http.ResponseWriter, r *http.Request, db *sql.DB, bookID int) {
	var body struct {
		WordID  int    `json:"wordId"`
		Term    string `json:"term"`
		Meaning string `json:"meaning"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if body.WordID == 0 || body.Term == "" || body.Meaning == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "wordId, term and meaning are required"})
		return
	}

	// 単語がこのブックに属しているか確認
	var existingBookID int
	err := db.QueryRow("SELECT book_id FROM word WHERE id = ?", body.WordID).Scan(&existingBookID)
	if err != nil || existingBookID != bookID {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "word not found or does not belong to this book"})
		return
	}

	// termが重複していないか確認（現在の単語を除外）
	var count int
	err = db.QueryRow(
		"SELECT COUNT(*) FROM word WHERE book_id = ? AND term = ? AND id != ?",
		bookID, body.Term, body.WordID,
	).Scan(&count)
	if err != nil || count > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "term already exists in this book"})
		return
	}

	_, err = db.Exec(
		"UPDATE word SET term = ?, meaning = ? WHERE id = ?",
		body.Term, body.Meaning, body.WordID,
	)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to update word"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}

func handleDeleteWord(w http.ResponseWriter, r *http.Request, db *sql.DB, bookID int) {
	var body struct {
		WordID int `json:"wordId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if body.WordID == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "wordId is required"})
		return
	}

	// 単語がこのブックに属しているか確認
	var existingBookID int
	err := db.QueryRow("SELECT book_id FROM word WHERE id = ?", body.WordID).Scan(&existingBookID)
	if err != nil || existingBookID != bookID {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "word not found or does not belong to this book"})
		return
	}

	_, err = db.Exec("DELETE FROM word WHERE id = ?", body.WordID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to delete word"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}
