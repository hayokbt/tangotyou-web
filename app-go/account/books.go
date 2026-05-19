package account

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
)

func HandleBooks(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if handleCorsPreflight(w, r) {
			return
		}

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

		switch r.Method {
		case http.MethodGet:
			rows, err := db.Query("SELECT id, title FROM book WHERE user_id = ?", userID)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch books"})
				return
			}
			defer rows.Close()

			books := []map[string]interface{}{}
			for rows.Next() {
				var id int
				var title string
				if err := rows.Scan(&id, &title); err != nil {
					continue
				}
				books = append(books, map[string]interface{}{"id": id, "title": title})
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"books":   books,
			})
		case http.MethodPost:
			var body struct {
				Title string `json:"title"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
				return
			}
			if body.Title == "" {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "title is required"})
				return
			}

			result, err := db.Exec("INSERT INTO book (title, user_id) VALUES (?, ?)", body.Title, userID)
			if err != nil {
				msg := err.Error()
				if strings.Contains(msg, "UNIQUE constraint failed") {
					w.WriteHeader(http.StatusBadRequest)
					json.NewEncoder(w).Encode(map[string]string{"error": "book already exists"})
					return
				}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": "failed to create book"})
				return
			}

			bookID, _ := result.LastInsertId()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"id":      bookID,
			})
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		case http.MethodDelete:
			var body struct {
				Title string `json:"title"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
				return
			}
			if body.Title == "" {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "title is required"})
				return
			}

			// ユーザーが所有するbookであることを確認してから削除
			var bookUserID int
			err := db.QueryRow("SELECT user_id FROM book WHERE title = ? AND user_id = ?", body.Title, userID).Scan(&bookUserID)
			if err != nil {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": "book not found"})
				return
			}

			_, err = db.Exec("DELETE FROM book WHERE title = ? AND user_id = ?", body.Title, userID)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": "failed to delete book"})
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
			})
		}
	}
}
