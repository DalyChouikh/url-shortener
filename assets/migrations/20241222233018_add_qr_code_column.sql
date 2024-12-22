-- +goose Up
-- +goose StatementBegin
ALTER TABLE url 
    ADD COLUMN qr_code TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE url 
    DROP COLUMN qr_code;
-- +goose StatementEnd
