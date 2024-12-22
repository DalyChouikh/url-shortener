-- +goose Up
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    picture TEXT,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

ALTER TABLE url 
    ADD COLUMN user_id INTEGER REFERENCES users(id),
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN deleted_at TIMESTAMP;

-- +goose Down
ALTER TABLE url 
    DROP COLUMN user_id,
    DROP COLUMN updated_at,
    DROP COLUMN deleted_at;

DROP TABLE users;
