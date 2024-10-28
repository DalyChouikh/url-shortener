package routes

import (
	"database/sql"

	"github.com/DalyChouikh/url-shortener/api"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(db *sql.DB) *gin.Engine {
	urlHandler := api.NewUrlHandler(db)

	router := gin.Default()

	router.GET("/", urlHandler.HandleGetHome)
	router.POST("/shorten", urlHandler.HandlePostUrl)
	router.GET("/:short_code", urlHandler.HandleGetUrl)

	return router

}
