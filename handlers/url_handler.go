package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/DalyChouikh/url-shortener/services"
	"github.com/gin-gonic/gin"
)

type URLHandler struct {
	urlService *services.URLService
}

func NewURLHandler(urlService *services.URLService) *URLHandler {
	return &URLHandler{urlService: urlService}
}

type ShortenRequest struct {
	LongURL string `json:"long_url" binding:"required,url"`
}

type ShortenResponse struct {
	ShortURL string `json:"short_url"`
	QRCode   string `json:"qrcode,omitempty"`
}

func (h *URLHandler) HandleShortenURL(c *gin.Context) {
	var req ShortenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Request format"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	url, qrCode, err := h.urlService.CreateShortURL(ctx, req.LongURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ShortenResponse{
		ShortURL: fmt.Sprintf("%s/r/%s", h.urlService.BaseURL(), url.ShortCode),
		QRCode:   qrCode,
	})
}

func (h *URLHandler) HandleRedirect(c *gin.Context) {
	shortCode := c.Param("short_code")

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	longURL, err := h.urlService.GetLongURL(ctx, shortCode)
	if err != nil {
		c.HTML(http.StatusNotFound, "home.html", gin.H{"error": "Short URL not found"})
		return
	}

	c.Redirect(http.StatusMovedPermanently, longURL)
}

func (h *URLHandler) HandleGetHome(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "home.html", nil)
}

func (h *URLHandler) HandleGetPing(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
}
