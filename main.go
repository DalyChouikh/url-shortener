package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/DalyChouikh/url-shortener/config"
	"github.com/DalyChouikh/url-shortener/handlers"
	"github.com/DalyChouikh/url-shortener/models"
	"github.com/DalyChouikh/url-shortener/routes"
	"github.com/DalyChouikh/url-shortener/services"
	"github.com/DalyChouikh/url-shortener/utils"
	"github.com/joho/godotenv"
)

const (
	DEVELOPMENT = "development"
	PRODUCTION  = "production"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	env := getEnv("ENV", DEVELOPMENT)
	if err := godotenv.Load(".env." + env); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	cfg := config.NewConfig(
		env,
		os.Getenv("DATABASE_CONNECTION_STRING"),
	)

	db, err := config.InitDB(cfg.DBConfig)
	if err != nil {
		return err
	}

	defer db.Close()

	urlRepo := models.NewURLRepository(db)
	urlService := services.NewURLService(urlRepo, cfg.BaseURL)
	urlHandler := handlers.NewURLHandler(urlService)

	router := routes.SetupRoutes(*urlHandler)

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Server.Port),
		Handler: router,
	}
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("Server error: %w", err)
	}
	go utils.KeepAlive()
	return nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
