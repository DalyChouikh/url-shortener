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

func (h *UrlHandler) HandleGetHome(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "home.html", nil)
}

func (h *UrlHandler) HandleGetPing(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
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
		log.Fatal(err)
		return
	}

	shortUrl := utils.GetBaseURL() + "/r/" + shortCode
	qrCodeImage, err := utils.GenerateQRCodeImage(shortUrl)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate QR code"})
		log.Fatal(err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"short_url": shortUrl,
		"qrcode":    qrCodeImage,
	})
}

func (h *UrlHandler) HandleGetUrl(ctx *gin.Context) {
	shortCode := ctx.Param("short_code")
	longUrl, err := models.GetUrl(h.db, shortCode)
	if err != nil {
		ctx.HTML(http.StatusNotFound, "home.html", gin.H{
			"Error": "Invalid code",
		})
		return
	}

	ctx.Redirect(http.StatusMovedPermanently, longUrl)
}
