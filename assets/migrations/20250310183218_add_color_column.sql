-- +goose Up
-- +goose StatementBegin
ALTER TABLE URL ADD COLUMN color VARCHAR(255) NOT NULL DEFAULT '#000000';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE URL DROP COLUMN color;
-- +goose StatementEnd
