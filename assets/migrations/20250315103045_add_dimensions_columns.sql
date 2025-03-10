-- +goose Up
-- +goose StatementBegin
ALTER TABLE URL ADD COLUMN width INT NOT NULL DEFAULT 150;
ALTER TABLE URL ADD COLUMN height INT NOT NULL DEFAULT 150;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE URL DROP COLUMN width;
ALTER TABLE URL DROP COLUMN height;
-- +goose StatementEnd
