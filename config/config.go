package config

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
)

type Config struct {
	Environment string
	BaseURL     string
	DBConfig    DatabaseConfig
	Server      ServerConfig
	OAuth       OAuthConfig
	Session     SessionConfig
	UseHTTPS    bool
}

type DatabaseConfig struct {
	ConnectionString string
}

type ServerConfig struct {
	Port int
}

type OAuthConfig struct {
	GoogleClientID     string
	GoogleClientSecret string
}

type SessionConfig struct {
	Secret string
}

func NewConfig(env, dbConnString string) *Config {
	baseURL := "https://gdg-on-campus-issatso.tn"
	useHTTPS := true
	if env == "development" {
		baseURL = "http://localhost:8080"
		useHTTPS = false
	}

	return &Config{
		Environment: env,
		BaseURL:     baseURL,
		UseHTTPS:    useHTTPS,
		DBConfig: DatabaseConfig{
			ConnectionString: dbConnString,
		},
		Server: ServerConfig{
			Port: 8080,
		},
		OAuth: OAuthConfig{
			GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
			GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		},
		Session: SessionConfig{
			Secret: os.Getenv("SESSION_SECRET"),
		},
	}
}

func InitDB(ctx context.Context, cfg DatabaseConfig) (*pgx.Conn, error) {
	conn, err := pgx.Connect(ctx, cfg.ConnectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return conn, nil
}
