package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

type Config struct {
	Environtment string
	BaseURL      string
	DBConfig     DatabaseConfig
	Server       ServerConfig
}

type DatabaseConfig struct {
	ConnectionString string
}

type ServerConfig struct {
	Port int
}

func NewConfig(env, dbConnString string) *Config {
	baseURL := "https://gdgc-issatso.tech"
	if env == "development" {
		baseURL = "http://localhost:8080"
	}

	return &Config{
		Environtment: env,
		BaseURL:      baseURL,
		DBConfig: DatabaseConfig{
			ConnectionString: dbConnString,
		},
		Server: ServerConfig{
			Port: 8080,
		},
	}
}

func InitDB(cfg DatabaseConfig) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.ConnectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
