-- +goose Up
-- +goose StatementBegin
CREATE TABLE URL (
  id SERIAL PRIMARY KEY,
  long_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE URL
-- +goose StatementEnd
