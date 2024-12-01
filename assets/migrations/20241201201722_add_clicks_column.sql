-- +goose Up
-- +goose StatementBegin
ALTER TABLE URL ADD COLUMN clicks INTEGER DEFAULT 0;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE URL DROP COLUMN clicks;
-- +goose StatementEnd
