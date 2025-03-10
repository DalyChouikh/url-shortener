-- +goose Up
-- +goose StatementBegin
ALTER TABLE URL ADD COLUMN format VARCHAR(255) NOT NULL DEFAULT 'png';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE URL DROP COLUMN format;
-- +goose StatementEnd
