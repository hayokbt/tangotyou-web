package account

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
)

// 引数に db を受け取り、http.HandlerFunc を返すように変更
func HandleNewAccount(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if handleCorsPreflight(w, r) {
			return
		}
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var creds struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
			return
		}

		if creds.Username == "" || creds.Password == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "username and password required"})
			return
		}

		_, err := db.Exec("INSERT INTO account (username, password) VALUES (?, ?)", creds.Username, creds.Password)
		if err != nil {
			msg := err.Error()
			if strings.Contains(msg, "UNIQUE constraint failed") {
				json.NewEncoder(w).Encode(map[string]string{"error": "Username already in use"})
			} else {
				json.NewEncoder(w).Encode(map[string]string{"error": msg})
			}
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "created"})
	}
}
