-- +goose Up
-- +goose StatementBegin
CREATE TABLE URL (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  long_url TEXT NOT NULL,
  short_url TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE URL
-- +goose StatementEnd
