.PHONY: frontend migrate-local migrate-production build start dev

migrate-local:
	@goose -dir assets/migrations postgres "user=postgres password=postgres123 host=localhost sslmode=disable dbname=gdgc-issatso" up

migrate-production:
	@goose -dir assets/migrations postgres "user=[username] password=[password] host=[host] sslmode=require dbname=[dbname]" up

frontend:
	@cd frontend && npm run build

build: frontend
	@go build -o bin/gdgc-issatso main.go

start: build
	@./bin/gdgclinky


dev: frontend
	@go run main.go

