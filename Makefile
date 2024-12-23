.PHONY: frontend migrate-local migrate-production build start dev create-migration

migrate-local:
	@goose -dir assets/migrations postgres "user=postgres password=postgres123 host=localhost sslmode=disable dbname=gdgc-issatso" up

migrate-production:
	@goose -dir assets/migrations postgres "user=[username] password=[password] host=[host] sslmode=require dbname=[dbname]" up

frontend:
	@cd frontend && npm i && npm run build

build: frontend
	@go build -o bin/gdgc-issatso main.go

start: build
	@./bin/gdgclinky


dev: frontend
	@go run main.go

create-migration:
	@if [ -z "$(name)" ]; then \
		echo "Please provide a migration name. Usage: make create-migration name=your_migration_name"; \
		exit 1; \
	fi
	@goose -dir assets/migrations create $(name) sql

