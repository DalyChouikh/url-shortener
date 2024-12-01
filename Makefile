migrate-local:
	@goose -dir assets/migrations postgres "user=postgres password=postgres123 host=localhost sslmode=disable dbname=gdgc-issatso" up

migrate-production:
	@goose -dir assets/migrations postgres "user=[username] password=[password] host=[host] sslmode=require dbname=[dbname]" up

build:
	@go build -o bin/gdgclinky main.go

run: build
	@./bin/gdgclinky

