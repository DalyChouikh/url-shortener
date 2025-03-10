package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
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
	LongURL   string                  `json:"long_url" binding:"required,url"`
	QROptions *services.QRCodeOptions `json:"qr_options,omitempty"`
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

	cleanURL := strings.ToLower(strings.TrimPrefix(strings.TrimPrefix(req.LongURL, "https://"), "http://"))
	if strings.Contains(cleanURL, "localhost:8080/r/") || strings.Contains(cleanURL, "gdgc-issatso.tech/r/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL already shortened"})
		return
	}

	session := sessions.Default(c)
	userID := session.Get("user_id").(uint)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Set default options if not provided
	if req.QROptions == nil {
		req.QROptions = &services.QRCodeOptions{
			Format: "png",
			Color:  "#000000",
		}
	}

	// No need to check for existing URLs here, the service will do it
	url, qrCode, err := h.urlService.CreateShortURL(ctx, req.LongURL, userID, req.QROptions)
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
		c.Redirect(http.StatusFound, "/?error=invalid_short_url")
		return
	}

	c.Header("Cache-Control", "no-store, no-cache, must-revalidate")
	c.Redirect(http.StatusTemporaryRedirect, longURL)
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

func (h *URLHandler) HandleDeleteURL(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id").(uint)

	urlID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}
	if err := h.urlService.DeleteURL(urlID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "URL deleted successfully"})
}

func (h *URLHandler) HandleUpdateURL(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id").(uint)

	urlID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	if _, err := h.urlService.GetURLById(urlID, userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	var req ShortenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Request format"})
		return
	}

	cleanURL := strings.ToLower(strings.TrimPrefix(strings.TrimPrefix(req.LongURL, "https://"), "http://"))
	if strings.Contains(cleanURL, "localhost:8080/r/") || strings.Contains(cleanURL, "gdgc-issatso.tech/r/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL already shortened"})
		return
	}

	if err := h.urlService.UpdateURL(urlID, userID, req.LongURL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "URL updated successfully"})
}

func (h *URLHandler) HandleGetURLById(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id").(uint)
	urlIdString := c.Param("id")

	urlId, err := strconv.Atoi(urlIdString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	url, err := h.urlService.GetURLById(urlId, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url})
}
