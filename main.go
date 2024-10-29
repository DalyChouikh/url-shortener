package main

import (
	"os"

	"github.com/DalyChouikh/url-shortener/config"
	"github.com/DalyChouikh/url-shortener/routes"
	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
)

const (
	DEVELOPMENT = "development"
	PRODUCTION  = "production"
)

func init() {
	env := os.Getenv("ENV")
	if env == "" {
		os.Setenv("ENV", "development")
	}
}

func main() {
	env := os.Getenv("ENV")
	if env == DEVELOPMENT {
		godotenv.Load(".env.development")
	}
	if env == PRODUCTION {
		godotenv.Load(".env.production")
	}
	databaseConnectionString := os.Getenv("DATABASE_CONNECTION_STRING")
	db := config.SetupDatabase(databaseConnectionString)
	defer db.Close()

	router := routes.SetupRoutes(db)
	router.Use(cors.Default())
	router.Run(":8080")
}
