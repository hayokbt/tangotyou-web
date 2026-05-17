package account

import (
	"net/http"
	"os"

	"github.com/gorilla/sessions"
)

const SessionName = "tangotyou-session"

var store *sessions.CookieStore

func InitSessionStore() {
	secret := []byte("change-this-to-a-secure-session-key-32-bytes")
	if envSecret := os.Getenv("SESSION_SECRET"); envSecret != "" {
		secret = []byte(envSecret)
	}
	store = sessions.NewCookieStore(secret)
	store.Options = &sessions.Options{
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400,
	}
}

func handleCorsPreflight(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return true
	}
	return false
}
