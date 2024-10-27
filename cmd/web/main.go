package main

import (
	"github.com/DalyChouikh/url-shortener/config"
	"github.com/DalyChouikh/url-shortener/routes"
)

func main() {
	db := config.SetupDatabase()
	defer db.Close()

	router := routes.SetupRoutes(db)
	router.Run(":8080")
}
