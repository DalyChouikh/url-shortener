package models

import "database/sql"

func SaveUrl(db *sql.DB, longUrl, shortCode string) error {
	_, err := db.Exec("INSERT INTO URL (long_url, short_code) VALUES (?, ?)", longUrl, shortCode)
	return err
}

func GetUrl(db *sql.DB, shortCode string) (string, error) {
	var longUrl string
	err := db.QueryRow("SELECT long_url FROM URL WHERE short_code = ?", shortCode).Scan(&longUrl)
	return longUrl, err
}
