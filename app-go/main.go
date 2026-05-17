package main

import (
	"database/sql"
	"fmt"
	"log"
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
	db, err := sql.Open("sqlite", "tangotyou.db")
	if err != nil {
		log.Fatalf("db open error: %v", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatalf("db ping error: %v", err)
	}

	if err := data.Setup(db); err != nil {
		log.Fatalf("db setup error: %v", err)
	}
	account.InitSessionStore()

	// 新規アカウント作成
	http.HandleFunc("/account/create", account.HandleNewAccount(db))
	// ログイン
	http.HandleFunc("/account/login", account.HandleLogin(db))
	// ログアウト
	http.HandleFunc("/account/logout", account.HandleLogout())
	// ログイン状態確認
	http.HandleFunc("/account/me", account.HandleMe())

	fmt.Println("Goサーバー起動")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
