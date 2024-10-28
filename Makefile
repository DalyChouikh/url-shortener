build:
	@go build -o bin/gdgclinky ./cmd/web/main.go

run: build
	@./bin/gdgclinky

