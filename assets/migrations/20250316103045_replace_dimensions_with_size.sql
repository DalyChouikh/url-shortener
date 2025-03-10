-- +goose Up
-- +goose StatementBegin
ALTER TABLE URL ADD COLUMN size INT NOT NULL DEFAULT 150;
UPDATE URL SET size = width; -- Use existing width value as the size
ALTER TABLE URL DROP COLUMN width;
ALTER TABLE URL DROP COLUMN height;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE URL ADD COLUMN width INT NOT NULL DEFAULT 150;
ALTER TABLE URL ADD COLUMN height INT NOT NULL DEFAULT 150;
UPDATE URL SET width = size, height = size;
ALTER TABLE URL DROP COLUMN size;
-- +goose StatementEnd
