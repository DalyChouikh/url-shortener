-- +goose Up
-- +goose StatementBegin
ALTER TABLE URL ADD COLUMN transparent BOOLEAN NOT NULL DEFAULT FALSE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE URL DROP COLUMN transparent;
-- +goose StatementEnd
