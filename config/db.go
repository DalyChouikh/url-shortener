package config

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"log"
)

func SetupDatabase() *sql.DB {
	db, err := sql.Open("sqlite3", "app.db")
	if err != nil {
		log.Fatal(err)
	}
	return db
}
