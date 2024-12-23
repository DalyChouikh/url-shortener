package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/DalyChouikh/url-shortener/services"
	"github.com/gin-contrib/sessions"
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

	session := sessions.Default(c)
	userID := session.Get("user_id").(uint)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	url, qrCode, err := h.urlService.CreateShortURL(ctx, req.LongURL, userID)
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

	longURL, err := h.urlService.GetLongURL(shortCode)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	c.Redirect(http.StatusMovedPermanently, longURL)
}

func (h *URLHandler) HandleGetPing(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
}

func (h *URLHandler) HandleGetUserURLs(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id").(uint)

	urls, err := h.urlService.GetUserURLs(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"urls": urls})
}
