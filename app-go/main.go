package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	_ "modernc.org/sqlite"

	"app-go/account"
	data "app-go/handler"
)

type Word struct {
	Term    string `json:"term"`
	Meaning string `json:"meaning"`
}

func main() {
	db, _ := sql.Open("sqlite", "tangotyou.db")
	defer db.Close()
	_ = db.Ping()

	_ = data.Setup(db)

	// データを1件返すだけの窓口（API）
	http.HandleFunc("/word", func(w http.ResponseWriter, r *http.Request) {
		row := db.QueryRow("SELECT term, meaning FROM words LIMIT 1")
		var word Word
		if err := row.Scan(&word.Term, &word.Meaning); err != nil {
			word = Word{Term: "Error", Meaning: "データがありません"}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(word)
	})

	// 新規アカウント作成
	http.HandleFunc("/account", account.HandleNewAccount(db))

	// ログイン
	http.HandleFunc("/login", account.HandleLogin(db))

	fmt.Println("Goサーバー起動")
	http.ListenAndServe(":8080", nil) // 8080ポートで待機
}
