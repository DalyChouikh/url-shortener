build:
	@go build -o bin/gdgclinky main.go

run: build
	@./bin/gdgclinky

