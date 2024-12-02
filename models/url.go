package models

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5"
)

type URL struct {
	ID        int64
	LongURL   string
	ShortCode string
	CreatedAt time.Time
	Clicks    int64
}

type URLRepository struct {
	conn *pgx.Conn
}

func NewURLRepository(conn *pgx.Conn) *URLRepository {
	return &URLRepository{conn: conn}
}

func (r *URLRepository) Save(ctx context.Context, url *URL) error {
	query := `
	INSERT INTO URL (long_url, short_code, created_at)
	VALUES($1, $2, $3)
	RETURNING id`
	err := r.conn.QueryRow(ctx, query, url.LongURL, url.ShortCode, url.CreatedAt).Scan(&url.ID)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to save URL: %w", err)
	}
	return nil
}

func (r *URLRepository) GetByShortCode(ctx context.Context, shortCode string) (*URL, error) {
	url := &URL{}
	query := `
	UPDATE URL
	SET clicks = clicks + 1
	WHERE short_code = $1
	RETURNING id, long_url, short_code, created_at, clicks`
	err := r.conn.QueryRow(ctx, query, shortCode).Scan(&url.ID, &url.LongURL, &url.ShortCode, &url.CreatedAt, &url.Clicks)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("URL not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get URL: %w", err)
	}
	return url, nil
}
