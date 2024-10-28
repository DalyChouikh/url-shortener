package config

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
)

func SetupDatabase(databaseConnectionString string) *sql.DB {
	db, err := sql.Open("postgres", databaseConnectionString)
	if err != nil {
		log.Fatal(err)
	}
	return db
}
