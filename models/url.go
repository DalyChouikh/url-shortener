package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type URL struct {
	ID        int64
	LongURL   string
	ShortCode string
	CreatedAt time.Time
	Clicks    int64
}

type URLRepository struct {
	db *sql.DB
}

func NewURLRepository(db *sql.DB) *URLRepository {
	return &URLRepository{db: db}
}

func (r *URLRepository) Save(ctx context.Context, url *URL) error {
	query := `
	INSERT INTO URL (long_url, short_code, created_at)
	VALUES($1, $2, $3)
	RETURNING id`
	err := r.db.QueryRowContext(ctx, query, url.LongURL, url.ShortCode, time.Now()).Scan(&url.ID)
	if err != nil {
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
	err := r.db.QueryRowContext(ctx, query, shortCode).Scan(&url.ID, &url.LongURL, &url.ShortCode, &url.CreatedAt, &url.Clicks)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("URL not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get URL: %w", err)
	}
	return url, nil
}
