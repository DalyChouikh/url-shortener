package api

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/DalyChouikh/url-shortener/models"
	"github.com/DalyChouikh/url-shortener/utils"
	"github.com/gin-gonic/gin"
)

type UrlHandler struct {
	db *sql.DB
}

func NewUrlHandler(db *sql.DB) *UrlHandler {
	return &UrlHandler{db: db}
}

func (h *UrlHandler) HandlePostUrl(ctx *gin.Context) {
	var request struct {
		LongUrl string `json:"long_url"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		log.Fatal(err)
		return
	}

	if isValid, err := utils.IsValidUrl(request.LongUrl); !isValid {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL", "message": err.Error()})
		return
	}

	shortCode := utils.GenerateShortCode()
	if err := models.SaveUrl(h.db, request.LongUrl, shortCode); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save URL"})
		log.Println(shortCode)
		log.Fatal(err)
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"short_code": "http://localhost:8080/" + shortCode})

}

func (h *UrlHandler) HandleGetUrl(ctx *gin.Context) {
	shortCode := ctx.Param("short_code")
	longUrl, err := models.GetUrl(h.db, shortCode)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Invalid code"})
		return
	}

	ctx.Redirect(http.StatusMovedPermanently, longUrl)
}
