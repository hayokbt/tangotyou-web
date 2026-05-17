package account

import (
	"encoding/json"
	"net/http"
)

func HandleMe() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if handleCorsPreflight(w, r) {
			return
		}
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		session, err := store.Get(r, SessionName)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "session error"})
			return
		}

		userID, ok := session.Values["user_id"].(int)
		username, _ := session.Values["username"].(string)
		if !ok || username == "" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"loggedIn": false})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":  true,
			"loggedIn": true,
			"id":       userID,
			"username": username,
		})
	}
}
