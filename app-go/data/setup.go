package data

import (
	"database/sql"
)

func Setup(db *sql.DB) error {
	_, err := db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return err
	}
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS account (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL
		);
	`)

	if err != nil {
		return err
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS book (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			user_id INTEGER,
			FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE,
			UNIQUE (user_id, title)
		);
	`)

	if err != nil {
		return err
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS word (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			term TEXT NOT NULL,
			meaning TEXT NOT NULL,
			book_id INTEGER,
			FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE,
			UNIQUE (book_id, term)
		);
	`)

	if err != nil {
		return err
	}

	return nil
}
